import {
  readJson,
  STORAGE_KEYS,
  writeJson,
  type KeyValueStorage,
} from './storage';
import type { LocalAttemptResult } from './types';

export interface PendingAttempt {
  clientAttemptId: string;
  lessonId: string;
  localResult: LocalAttemptResult;
  retries: number;
  lastError?: string;
  nextRetryAt?: number;
}

/**
 * Durable FIFO queue of unsynced attempts, scoped to one user. Items survive
 * restarts because the whole list is rewritten to storage on every change.
 */
export class Outbox {
  private readonly key: string;

  constructor(
    private readonly storage: KeyValueStorage,
    userId: string,
  ) {
    this.key = STORAGE_KEYS.outbox(userId);
  }

  async list(): Promise<PendingAttempt[]> {
    const stored = await readJson<PendingAttempt[]>(this.storage, this.key);

    return Array.isArray(stored) ? stored : [];
  }

  async enqueue(item: PendingAttempt): Promise<void> {
    const items = await this.list();

    if (items.some((entry) => entry.clientAttemptId === item.clientAttemptId)) {
      return;
    }

    await this.persist([...items, item]);
  }

  async remove(clientAttemptId: string): Promise<void> {
    const items = await this.list();

    await this.persist(
      items.filter((item) => item.clientAttemptId !== clientAttemptId),
    );
  }

  async markRetry(
    clientAttemptId: string,
    error: string,
    nextRetryAt: number,
  ): Promise<void> {
    await this.update(clientAttemptId, (item) => ({
      ...item,
      retries: item.retries + 1,
      lastError: error,
      nextRetryAt,
    }));
  }

  async markFailed(clientAttemptId: string, error: string): Promise<void> {
    await this.update(clientAttemptId, (item) => ({
      ...item,
      lastError: error,
    }));
  }

  private async update(
    clientAttemptId: string,
    change: (item: PendingAttempt) => PendingAttempt,
  ): Promise<void> {
    const items = await this.list();

    await this.persist(
      items.map((item) =>
        item.clientAttemptId === clientAttemptId ? change(item) : item,
      ),
    );
  }

  private async persist(items: PendingAttempt[]): Promise<void> {
    await writeJson(this.storage, this.key, items);
  }
}
