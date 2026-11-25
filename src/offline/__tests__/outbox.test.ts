import { MemoryStorage } from '@/testing/memory-storage';

import { Outbox, type PendingAttempt } from '../outbox';
import type { LocalAttemptResult } from '../types';

function localResult(clientAttemptId: string): LocalAttemptResult {
  return {
    clientAttemptId,
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

function pending(id: string): PendingAttempt {
  return {
    clientAttemptId: id,
    lessonId: 'foundations-1',
    localResult: localResult(id),
    retries: 0,
  };
}

describe('Outbox', () => {
  it('persists enqueued attempts across instances', async () => {
    const storage = new MemoryStorage();
    const first = new Outbox(storage, 'user-1');

    await first.enqueue(pending('c1'));

    const second = new Outbox(storage, 'user-1');

    expect((await second.list()).map((item) => item.clientAttemptId)).toEqual([
      'c1',
    ]);
  });

  it('keeps FIFO order', async () => {
    const storage = new MemoryStorage();
    const outbox = new Outbox(storage, 'user-1');

    await outbox.enqueue(pending('c1'));
    await outbox.enqueue(pending('c2'));
    await outbox.enqueue(pending('c3'));

    expect((await outbox.list()).map((item) => item.clientAttemptId)).toEqual([
      'c1',
      'c2',
      'c3',
    ]);
  });

  it('does not enqueue the same attempt twice', async () => {
    const outbox = new Outbox(new MemoryStorage(), 'user-1');

    await outbox.enqueue(pending('c1'));
    await outbox.enqueue(pending('c1'));

    expect(await outbox.list()).toHaveLength(1);
  });

  it('removes an attempt', async () => {
    const outbox = new Outbox(new MemoryStorage(), 'user-1');

    await outbox.enqueue(pending('c1'));
    await outbox.remove('c1');

    expect(await outbox.list()).toEqual([]);
  });

  it('keeps an attempt with a future retry time', async () => {
    const outbox = new Outbox(new MemoryStorage(), 'user-1');

    await outbox.enqueue(pending('c1'));
    await outbox.markRetry('c1', 'server exploded', 1_000_000);

    const [item] = await outbox.list();

    expect(item.clientAttemptId).toBe('c1');
    expect(item.lastError).toBe('server exploded');
    expect(item.nextRetryAt).toBe(1_000_000);
    expect(item.retries).toBe(1);
  });

  it('keeps a failed attempt for manual retry', async () => {
    const outbox = new Outbox(new MemoryStorage(), 'user-1');

    await outbox.enqueue(pending('c1'));
    await outbox.markFailed('c1', 'rejected');

    const [item] = await outbox.list();

    expect(item.clientAttemptId).toBe('c1');
    expect(item.lastError).toBe('rejected');
  });
});
