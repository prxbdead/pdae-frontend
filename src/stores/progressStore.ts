import { create } from 'zustand';

import type { AttemptResult, StreakState } from '@/api/contracts';
import {
  clampDailyGoal,
  DEFAULT_DAILY_GOAL,
} from '@/features/gamification/dailyGoal';
import {
  computeNextStreak,
  toLocalDateKey,
} from '@/features/gamification/streak';
import {
  ProgressRepository,
  type PersistedProgress,
} from '@/offline/progress';
import { createAsyncStorageKeyValue } from '@/offline/storage';
import type {
  LocalAttemptResult,
  LocalLessonProgress,
} from '@/offline/types';

const EMPTY_STREAK: StreakState = {
  current: 0,
  longest: 0,
  lastLessonDate: null,
  freezesEquipped: 0,
  restDay: null,
};

export interface ProgressState {
  userId: string | null;
  lessons: Record<string, LocalLessonProgress>;
  pendingXp: number;
  pendingXpByAttempt: Record<string, number>;
  lastResult: LocalAttemptResult | null;
  /** Set only after the server has reconciled the last attempt. */
  lastServerResult: AttemptResult | null;
  xpToday: number;
  xpTodayDate: string;
  dailyGoalXp: number;
  streak: StreakState;
  setUser(userId: string | null, dailyGoalXp?: number): Promise<void>;
  hydrate(): Promise<void>;
  applyLocalResult(result: LocalAttemptResult): Promise<void>;
  applyServerResult(result: AttemptResult): Promise<void>;
  setDailyGoal(xp: number): void;
  clear(): void;
}

let repository = new ProgressRepository(createAsyncStorageKeyValue());

/** Test seam: swap in a repository backed by a fake store. */
export function setProgressRepository(next: ProgressRepository): void {
  repository = next;
}

export const useProgressStore = create<ProgressState>()((set, get) => {
  const persist = async (): Promise<void> => {
    const state = get();

    if (!state.userId) {
      return;
    }

    const snapshot: PersistedProgress = {
      lessons: state.lessons,
      pendingXp: state.pendingXp,
      pendingXpByAttempt: state.pendingXpByAttempt,
      xpToday: state.xpToday,
      xpTodayDate: state.xpTodayDate,
      dailyGoalXp: state.dailyGoalXp,
      streak: state.streak,
    };

    await repository.save(state.userId, snapshot);
  };

  return {
    userId: null,
    lessons: {},
    pendingXp: 0,
    pendingXpByAttempt: {},
    lastResult: null,
    lastServerResult: null,
    xpToday: 0,
    xpTodayDate: toLocalDateKey(new Date()),
    dailyGoalXp: DEFAULT_DAILY_GOAL,
    streak: { ...EMPTY_STREAK },

    setUser: async (userId, dailyGoalXp = DEFAULT_DAILY_GOAL) => {
      set({
        userId,
        lessons: {},
        pendingXp: 0,
        pendingXpByAttempt: {},
        lastResult: null,
        lastServerResult: null,
        xpToday: 0,
        xpTodayDate: toLocalDateKey(new Date()),
        dailyGoalXp: clampDailyGoal(dailyGoalXp),
        streak: { ...EMPTY_STREAK },
      });

      if (userId) {
        await get().hydrate();
      }
    },

    hydrate: async () => {
      const { userId } = get();

      if (!userId) {
        return;
      }

      const stored = await repository.get(userId);
      const today = toLocalDateKey(new Date());

      set({
        lessons: stored?.lessons ?? {},
        pendingXp: stored?.pendingXp ?? 0,
        pendingXpByAttempt: stored?.pendingXpByAttempt ?? {},
        xpToday: stored?.xpTodayDate === today ? (stored.xpToday ?? 0) : 0,
        xpTodayDate: today,
        dailyGoalXp: clampDailyGoal(
          stored?.dailyGoalXp ?? get().dailyGoalXp,
        ),
        streak: stored?.streak ?? { ...EMPTY_STREAK },
      });
    },

    applyLocalResult: async (result) => {
      const state = get();

      // The same attempt can arrive twice (local completion plus a sync replay).
      if (state.pendingXpByAttempt[result.clientAttemptId] !== undefined) {
        return;
      }

      const completedAt = new Date(result.completedAt);
      const completedDate = toLocalDateKey(completedAt);
      const previous = state.lessons[result.lessonId];
      const lessons: Record<string, LocalLessonProgress> = {
        ...state.lessons,
        [result.lessonId]: {
          lessonId: result.lessonId,
          status: result.passed ? 'completed' : 'in_progress',
          bestScore: Math.max(previous?.bestScore ?? 0, result.score),
          attempts: (previous?.attempts ?? 0) + 1,
          lastAttemptAt: result.completedAt,
        },
      };
      const nextStreak = computeNextStreak(
        {
          current: state.streak.current,
          longest: state.streak.longest,
          lastLessonDate: state.streak.lastLessonDate,
        },
        completedAt,
      );

      set({
        lessons,
        pendingXp: state.pendingXp + result.xpEarned,
        pendingXpByAttempt: {
          ...state.pendingXpByAttempt,
          [result.clientAttemptId]: result.xpEarned,
        },
        lastResult: result,
        xpToday:
          (state.xpTodayDate === completedDate ? state.xpToday : 0) +
          result.xpEarned,
        xpTodayDate: completedDate,
        streak: { ...state.streak, ...nextStreak },
      });

      await persist();
    },

    applyServerResult: async (result) => {
      const state = get();
      const localXp = state.pendingXpByAttempt[result.clientAttemptId];

      // Already reconciled, or this attempt was never queued locally.
      if (localXp === undefined) {
        return;
      }

      const delta = result.xpEarned - localXp;
      const today = toLocalDateKey(new Date());
      const sameAttempt =
        state.lastResult?.clientAttemptId === result.clientAttemptId;
      const pendingXpByAttempt = { ...state.pendingXpByAttempt };

      delete pendingXpByAttempt[result.clientAttemptId];

      const previous = state.lessons[result.lessonId];
      const lessons: Record<string, LocalLessonProgress> = {
        ...state.lessons,
        [result.lessonId]: {
          lessonId: result.lessonId,
          status: result.passed
            ? 'completed'
            : (previous?.status ?? 'in_progress'),
          bestScore: Math.max(previous?.bestScore ?? 0, result.score),
          attempts: previous?.attempts ?? 1,
          ...(previous?.lastAttemptAt
            ? { lastAttemptAt: previous.lastAttemptAt }
            : {}),
        },
      };

      set({
        lessons,
        pendingXp: Math.max(0, state.pendingXp + delta),
        pendingXpByAttempt,
        xpToday:
          sameAttempt && state.xpTodayDate === today
            ? Math.max(0, state.xpToday + delta)
            : state.xpToday,
        streak: { ...result.streak },
        lastServerResult: result,
      });

      await persist();
    },

    setDailyGoal: (xp) => {
      set({ dailyGoalXp: clampDailyGoal(xp) });
      void persist();
    },

    clear: () => {
      const { userId } = get();

      set({
        userId: null,
        lessons: {},
        pendingXp: 0,
        pendingXpByAttempt: {},
        lastResult: null,
        lastServerResult: null,
        xpToday: 0,
        xpTodayDate: toLocalDateKey(new Date()),
        dailyGoalXp: DEFAULT_DAILY_GOAL,
        streak: { ...EMPTY_STREAK },
      });

      if (userId) {
        void repository.clear(userId);
      }
    },
  };
});
