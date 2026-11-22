import type { AttemptResult, StreakState } from '@/api/contracts';
import { toLocalDateKey } from '@/features/gamification/streak';
import { ProgressRepository } from '@/offline/progress';
import type { LocalAttemptResult } from '@/offline/types';
import { MemoryStorage } from '@/testing/memory-storage';

import { setProgressRepository, useProgressStore } from '../progressStore';

const EMPTY_STREAK: StreakState = {
  current: 0,
  longest: 0,
  lastLessonDate: null,
  freezesEquipped: 0,
  restDay: null,
};

const COMPLETED_AT = new Date();
const COMPLETED_DATE = toLocalDateKey(COMPLETED_AT);

function localResult(
  overrides: Partial<LocalAttemptResult> = {},
): LocalAttemptResult {
  return {
    clientAttemptId: 'client-1',
    lessonId: 'foundations-1',
    startedAt: new Date(COMPLETED_AT.getTime() - 180_000).toISOString(),
    completedAt: COMPLETED_AT.toISOString(),
    answers: [],
    score: 0.8,
    passed: true,
    xpEarned: 40,
    heartsLost: 0,
    mistakes: [],
    ...overrides,
  };
}

function serverResult(
  overrides: Partial<AttemptResult> = {},
): AttemptResult {
  return {
    attemptId: 'attempt-1',
    clientAttemptId: 'client-1',
    lessonId: 'foundations-1',
    score: 1,
    passed: true,
    xpEarned: 50,
    hearts: 5,
    streak: {
      current: 5,
      longest: 7,
      lastLessonDate: '2026-01-01',
      freezesEquipped: 0,
      restDay: null,
    },
    newAchievements: [],
    ...overrides,
  };
}

let storage: MemoryStorage;

function resetStore(): void {
  useProgressStore.setState({
    userId: null,
    lessons: {},
    pendingXp: 0,
    pendingXpByAttempt: {},
    lastResult: null,
    lastServerResult: null,
    xpToday: 0,
    xpTodayDate: toLocalDateKey(new Date()),
    dailyGoalXp: 30,
    streak: { ...EMPTY_STREAK },
  });
}

beforeEach(() => {
  storage = new MemoryStorage();
  setProgressRepository(new ProgressRepository(storage));
  resetStore();
});

describe('progressStore reconciliation', () => {
  it('applies local XP, daily XP, and the streak', async () => {
    await useProgressStore.getState().setUser('user-1', 30);
    await useProgressStore.getState().applyLocalResult(localResult());

    const state = useProgressStore.getState();

    expect(state.pendingXp).toBe(40);
    expect(state.pendingXpByAttempt['client-1']).toBe(40);
    expect(state.xpToday).toBe(40);
    expect(state.streak).toMatchObject({
      current: 1,
      longest: 1,
      lastLessonDate: COMPLETED_DATE,
    });
    expect(state.lessons['foundations-1'].status).toBe('completed');
  });

  it('replaces the pending XP with the server value and applies the server streak', async () => {
    await useProgressStore.getState().setUser('user-1', 30);
    await useProgressStore.getState().applyLocalResult(localResult());
    await useProgressStore.getState().applyServerResult(serverResult());

    const state = useProgressStore.getState();

    expect(state.pendingXp).toBe(50);
    expect(state.pendingXpByAttempt['client-1']).toBeUndefined();
    expect(state.xpToday).toBe(50);
    expect(state.streak.current).toBe(5);
    expect(state.streak.longest).toBe(7);
    expect(state.lastServerResult?.clientAttemptId).toBe('client-1');
    expect(state.lessons['foundations-1'].bestScore).toBe(1);
  });

  it('is idempotent when the server result arrives twice', async () => {
    await useProgressStore.getState().setUser('user-1', 30);
    await useProgressStore.getState().applyLocalResult(localResult());
    await useProgressStore.getState().applyServerResult(serverResult());
    await useProgressStore.getState().applyServerResult(serverResult());

    const state = useProgressStore.getState();

    expect(state.pendingXp).toBe(50);
    expect(state.xpToday).toBe(50);
    expect(state.lessons['foundations-1'].attempts).toBe(1);
  });

  it('ignores a server result that was never queued locally', async () => {
    await useProgressStore.getState().setUser('user-1', 30);
    await useProgressStore
      .getState()
      .applyServerResult(serverResult({ clientAttemptId: 'unknown' }));

    const state = useProgressStore.getState();

    expect(state.pendingXp).toBe(0);
    expect(state.lastServerResult).toBeNull();
  });

  it('persists and restores pending XP and the streak across a restart', async () => {
    await useProgressStore.getState().setUser('user-1', 30);
    await useProgressStore.getState().applyLocalResult(localResult());

    useProgressStore.setState({
      lessons: {},
      pendingXp: 0,
      pendingXpByAttempt: {},
      xpToday: 0,
      streak: { ...EMPTY_STREAK },
    });
    await useProgressStore.getState().hydrate();

    const state = useProgressStore.getState();

    expect(state.pendingXp).toBe(40);
    expect(state.pendingXpByAttempt['client-1']).toBe(40);
    expect(state.xpToday).toBe(40);
    expect(state.streak.current).toBe(1);
    expect(state.lessons['foundations-1'].status).toBe('completed');
  });

  it('clamps and persists the daily goal', async () => {
    await useProgressStore.getState().setUser('user-1', 30);

    useProgressStore.getState().setDailyGoal(20);

    expect(useProgressStore.getState().dailyGoalXp).toBe(30);

    useProgressStore.getState().setDailyGoal(50);

    expect(useProgressStore.getState().dailyGoalXp).toBe(50);

    await new Promise((resolve) => setTimeout(resolve, 0));

    resetStore();
    await useProgressStore.getState().setUser('user-1', 10);

    expect(useProgressStore.getState().dailyGoalXp).toBe(50);
  });

  it('resets daily XP when the stored day is stale', async () => {
    await storage.setItem(
      'hodlo:v1:progress:user-1',
      JSON.stringify({
        lessons: {},
        xpToday: 40,
        xpTodayDate: '2020-01-01',
        dailyGoalXp: 50,
        streak: { ...EMPTY_STREAK },
      }),
    );

    await useProgressStore.getState().setUser('user-1', 10);

    expect(useProgressStore.getState().xpToday).toBe(0);
    expect(useProgressStore.getState().dailyGoalXp).toBe(50);
  });
});
