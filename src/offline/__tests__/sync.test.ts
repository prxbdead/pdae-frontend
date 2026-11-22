import type { ApiClient } from '@/api/contracts';
import { ApiError } from '@/api/errors';
import { MemoryStorage } from '@/testing/memory-storage';

import { Outbox, type PendingAttempt } from '../outbox';
import { SyncEngine } from '../sync';
import type { LocalAttemptResult } from '../types';

function localResult(): LocalAttemptResult {
  return {
    clientAttemptId: 'client-1',
    lessonId: 'foundations-1',
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

function pending(): PendingAttempt {
  return {
    clientAttemptId: 'client-1',
    lessonId: 'foundations-1',
    localResult: localResult(),
    retries: 0,
  };
}

const serverResult = {
  attemptId: 'attempt-1',
  clientAttemptId: 'client-1',
  lessonId: 'foundations-1',
  score: 1,
  passed: true,
  xpEarned: 40,
  hearts: 5,
  streak: {
    current: 1,
    longest: 1,
    lastLessonDate: '2026-01-01',
    freezesEquipped: 0,
    restDay: null,
  },
  newAchievements: [],
};

const NOW = 1_700_000_000_000;

function buildEngine(options: {
  online: boolean;
  submit: jest.Mock;
  onResult?: jest.Mock;
}) {
  const storage = new MemoryStorage();
  const outbox = new Outbox(storage, 'user-1');
  const onResult = options.onResult ?? jest.fn(async () => undefined);
  const engine = new SyncEngine({
    api: { attempts: { submit: options.submit } } as unknown as ApiClient,
    outbox,
    onResult,
    isOnline: () => options.online,
    now: () => NOW,
  });

  return { engine, outbox, onResult };
}

describe('SyncEngine', () => {
  it('submits, removes, and reports a successful flush', async () => {
    const submit = jest.fn().mockResolvedValue(serverResult);
    const { engine, outbox, onResult } = buildEngine({ online: true, submit });

    await engine.enqueue(pending());
    const status = await engine.flush();

    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({ lessonId: 'foundations-1' }),
      'client-1',
    );
    expect(onResult).toHaveBeenCalledWith(serverResult);
    expect(await outbox.list()).toEqual([]);
    expect(status).toMatchObject({ state: 'idle', pending: 0 });
    expect(status.lastSyncedAt).not.toBeNull();
  });

  it('does not call the API while offline and keeps the item', async () => {
    const submit = jest.fn();
    const { engine, outbox } = buildEngine({ online: false, submit });

    await engine.enqueue(pending());
    const status = await engine.flush();

    expect(submit).not.toHaveBeenCalled();
    expect(status.state).toBe('offline');
    expect(status.pending).toBe(1);
    expect(await outbox.list()).toHaveLength(1);
  });

  it('pauses sync on 401 and keeps the attempt', async () => {
    const submit = jest
      .fn()
      .mockRejectedValue(new ApiError('Not authenticated', 401));
    const { engine, outbox } = buildEngine({ online: true, submit });

    await engine.enqueue(pending());
    const status = await engine.flush();

    expect(status.state).toBe('paused_auth');
    expect(await outbox.list()).toHaveLength(1);
  });

  it('schedules a retry with backoff on 500', async () => {
    const submit = jest
      .fn()
      .mockRejectedValue(new ApiError('Server error', 500));
    const { engine, outbox } = buildEngine({ online: true, submit });

    await engine.enqueue(pending());
    const status = await engine.flush();

    const [item] = await outbox.list();

    expect(status.state).not.toBe('idle');
    expect(item.retries).toBe(1);
    expect(item.nextRetryAt).toBeGreaterThan(NOW);
    expect(item.lastError).toContain('Server error');
  });

  it('skips items whose retry time has not arrived', async () => {
    const submit = jest.fn().mockResolvedValue(serverResult);
    const { engine, outbox } = buildEngine({ online: true, submit });

    await outbox.enqueue({ ...pending(), nextRetryAt: NOW + 60_000 });
    await engine.flush();

    expect(submit).not.toHaveBeenCalled();
    expect(await outbox.list()).toHaveLength(1);
  });

  it('marks a 4xx attempt failed but keeps it', async () => {
    const submit = jest
      .fn()
      .mockRejectedValue(new ApiError('Attempt rejected', 422));
    const { engine, outbox } = buildEngine({ online: true, submit });

    await engine.enqueue(pending());
    const status = await engine.flush();

    const [item] = await outbox.list();

    expect(status.state).toBe('error');
    expect(item.lastError).toContain('Attempt rejected');
  });
});
