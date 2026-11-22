import { MockApiClient } from '@/api/mock';
import type { LocalAttemptResult } from '@/offline/types';
import { ProgressRepository } from '@/offline/progress';
import { useProgressStore, setProgressRepository } from '@/stores/progressStore';
import { MemoryStorage } from '@/testing/memory-storage';
import { mockUser } from '@/api/fixtures';

import { Outbox } from '../outbox';
import { SyncEngine } from '../sync';

const LESSON_ID = 'foundations-1';

function localResult(): LocalAttemptResult {
  return {
    clientAttemptId: 'client-offline-1',
    lessonId: LESSON_ID,
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:03:00.000Z',
    answers: [],
    score: 1,
    passed: true,
    xpEarned: 40,
    heartsLost: 0,
    mistakes: [],
  };
}

describe('offline lesson completion', () => {
  it('queues the attempt offline and syncs it exactly once on reconnect', async () => {
    const storage = new MemoryStorage();
    const outbox = new Outbox(storage, mockUser.id);

    setProgressRepository(new ProgressRepository(storage));
    await useProgressStore.getState().setUser(mockUser.id);

    const api = new MockApiClient();
    await api.auth.login({ email: mockUser.email, password: 'password123' });
    const submit = jest.spyOn(api.attempts, 'submit');

    let online = false;
    const engine = new SyncEngine({
      api,
      outbox,
      onResult: async (serverResult) => {
        await useProgressStore.getState().applyLocalResult({
          ...localResult(),
          clientAttemptId: serverResult.clientAttemptId,
          score: serverResult.score,
          passed: serverResult.passed,
          xpEarned: serverResult.xpEarned,
        });
      },
      isOnline: () => online,
      now: Date.now,
    });

    const result = localResult();
    await useProgressStore.getState().applyLocalResult(result);
    await engine.enqueue({
      clientAttemptId: result.clientAttemptId,
      lessonId: LESSON_ID,
      localResult: result,
      retries: 0,
    });

    const offlineStatus = await engine.flush();

    expect(offlineStatus.state).toBe('offline');
    expect(await outbox.list()).toHaveLength(1);
    expect(useProgressStore.getState().lessons[LESSON_ID].status).toBe(
      'completed',
    );
    expect(useProgressStore.getState().pendingXp).toBe(40);

    online = true;
    const synced = await engine.flush();

    expect(synced.state).toBe('idle');
    expect(await outbox.list()).toEqual([]);

    const serverProgress = await api.progress.getProgress();
    expect(serverProgress).toEqual([
      expect.objectContaining({ lessonId: LESSON_ID, status: 'completed' }),
    ]);

    // A retry after a crash between submit and removal must not double XP.
    await engine.enqueue({
      clientAttemptId: result.clientAttemptId,
      lessonId: LESSON_ID,
      localResult: result,
      retries: 0,
    });
    await engine.flush();

    expect(submit).toHaveBeenCalledTimes(2);
    expect(submit.mock.calls[0][1]).toBe('client-offline-1');
    expect(submit.mock.calls[1][1]).toBe('client-offline-1');
    expect(useProgressStore.getState().pendingXp).toBe(40);
    expect((await api.progress.getProgress())[0].attempts).toBe(1);
  });
});
