import { toLocalDateKey } from '@/features/gamification/streak';
import { STORAGE_KEYS } from '@/offline/storage';
import { ProgressRepository } from '@/offline/progress';
import type { LocalAttemptResult } from '@/offline/types';
import { MemoryStorage } from '@/testing/memory-storage';

import { setProgressRepository, useProgressStore } from '../progressStore';

function result(overrides: Partial<LocalAttemptResult> = {}): LocalAttemptResult {
  return {
    clientAttemptId: 'client-1',
    lessonId: 'foundations-1',
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:03:00.000Z',
    answers: [],
    score: 0.8,
    passed: true,
    xpEarned: 40,
    heartsLost: 0,
    mistakes: [],
    ...overrides,
  };
}

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
  setProgressRepository(new ProgressRepository(storage));
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
    streak: {
      current: 0,
      longest: 0,
      lastLessonDate: null,
      freezesEquipped: 0,
      restDay: null,
    },
  });
});

describe('progressStore', () => {
  it('marks a passed lesson complete and records pending XP', async () => {
    await useProgressStore.getState().setUser('user-1');
    await useProgressStore.getState().applyLocalResult(result());

    const state = useProgressStore.getState();

    expect(state.lessons['foundations-1']).toMatchObject({
      status: 'completed',
      bestScore: 0.8,
      attempts: 1,
    });
    expect(state.pendingXp).toBe(40);
    expect(state.lastResult?.clientAttemptId).toBe('client-1');
    expect(await storage.getItem(STORAGE_KEYS.progress('user-1'))).toContain(
      'foundations-1',
    );
  });

  it('keeps an in-progress lesson and the best score', async () => {
    await useProgressStore.getState().setUser('user-1');
    await useProgressStore
      .getState()
      .applyLocalResult(result({ passed: false, score: 0.5 }));
    await useProgressStore.getState().applyLocalResult(
      result({ clientAttemptId: 'client-2', passed: false, score: 0.7 }),
    );

    const lesson = useProgressStore.getState().lessons['foundations-1'];

    expect(lesson.status).toBe('in_progress');
    expect(lesson.bestScore).toBe(0.7);
    expect(lesson.attempts).toBe(2);
  });

  it('applies XP once for the same attempt', async () => {
    await useProgressStore.getState().setUser('user-1');
    await useProgressStore.getState().applyLocalResult(result());
    await useProgressStore.getState().applyLocalResult(result());

    expect(useProgressStore.getState().pendingXp).toBe(40);
  });

  it('hydrates saved progress for a user', async () => {
    await useProgressStore.getState().setUser('user-1');
    await useProgressStore.getState().applyLocalResult(result());

    useProgressStore.setState({ lessons: {} });
    await useProgressStore.getState().hydrate();

    expect(useProgressStore.getState().lessons['foundations-1']).toMatchObject({
      status: 'completed',
    });
  });

  it('records missed exercises without duplicates', async () => {
    await useProgressStore.getState().setUser('user-1');
    await useProgressStore
      .getState()
      .applyLocalResult(result({ mistakes: ['e1', 'e2'] }));
    await useProgressStore.getState().applyLocalResult(
      result({
        clientAttemptId: 'client-2',
        mistakes: ['e2', 'e3'],
      }),
    );

    expect(useProgressStore.getState().mistakeIds).toEqual(['e1', 'e2', 'e3']);
  });

  it('clears one reviewed mistake and persists the rest', async () => {
    await useProgressStore.getState().setUser('user-1');
    await useProgressStore
      .getState()
      .applyLocalResult(result({ mistakes: ['e1', 'e2'] }));

    useProgressStore.getState().clearMistake('e1');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(useProgressStore.getState().mistakeIds).toEqual(['e2']);

    useProgressStore.setState({ mistakeIds: [] });
    await useProgressStore.getState().hydrate();

    expect(useProgressStore.getState().mistakeIds).toEqual(['e2']);
  });

  it('resets mistakes when the user data is cleared', async () => {
    await useProgressStore.getState().setUser('user-1');
    await useProgressStore
      .getState()
      .applyLocalResult(result({ mistakes: ['e1'] }));

    useProgressStore.getState().clear();

    expect(useProgressStore.getState().mistakeIds).toEqual([]);
  });

  it('clears user data without touching the content pack', async () => {
    await storage.setItem(STORAGE_KEYS.contentPack, '{"version":"1.0.0"}');
    await useProgressStore.getState().setUser('user-1');
    await useProgressStore.getState().applyLocalResult(result());

    useProgressStore.getState().clear();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(await storage.getItem(STORAGE_KEYS.progress('user-1'))).toBeNull();
    expect(await storage.getItem(STORAGE_KEYS.contentPack)).not.toBeNull();
    expect(useProgressStore.getState().userId).toBeNull();
    expect(useProgressStore.getState().pendingXp).toBe(0);
  });
});
