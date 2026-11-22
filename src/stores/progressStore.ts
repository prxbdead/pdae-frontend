import { create } from 'zustand';

import { ProgressRepository } from '@/offline/progress';
import { createAsyncStorageKeyValue } from '@/offline/storage';
import type {
  LocalAttemptResult,
  LocalLessonProgress,
} from '@/offline/types';

export interface ProgressState {
  userId: string | null;
  lessons: Record<string, LocalLessonProgress>;
  pendingXp: number;
  pendingXpByAttempt: Record<string, number>;
  lastResult: LocalAttemptResult | null;
  setUser(userId: string | null): Promise<void>;
  hydrate(): Promise<void>;
  applyLocalResult(result: LocalAttemptResult): Promise<void>;
  clear(): void;
}

let repository = new ProgressRepository(createAsyncStorageKeyValue());

/** Test seam: swap in a repository backed by a fake store. */
export function setProgressRepository(next: ProgressRepository): void {
  repository = next;
}

export const useProgressStore = create<ProgressState>()((set, get) => ({
  userId: null,
  lessons: {},
  pendingXp: 0,
  pendingXpByAttempt: {},
  lastResult: null,

  setUser: async (userId) => {
    set({
      userId,
      lessons: {},
      pendingXp: 0,
      pendingXpByAttempt: {},
      lastResult: null,
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

    const lessons = await repository.get(userId);
    set({ lessons });
  },

  applyLocalResult: async (result) => {
    const state = get();

    // The same attempt can arrive twice (local completion plus a sync replay).
    if (state.pendingXpByAttempt[result.clientAttemptId] !== undefined) {
      return;
    }

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

    set({
      lessons,
      pendingXp: state.pendingXp + result.xpEarned,
      pendingXpByAttempt: {
        ...state.pendingXpByAttempt,
        [result.clientAttemptId]: result.xpEarned,
      },
      lastResult: result,
    });

    if (state.userId) {
      await repository.save(state.userId, lessons);
    }
  },

  clear: () => {
    const { userId } = get();

    set({
      userId: null,
      lessons: {},
      pendingXp: 0,
      pendingXpByAttempt: {},
      lastResult: null,
    });

    if (userId) {
      void repository.clear(userId);
    }
  },
}));
