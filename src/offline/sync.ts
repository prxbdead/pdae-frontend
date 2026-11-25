import type { ApiClient, AttemptResult } from '@/api/contracts';
import { ApiError } from '@/api/errors';

import type { Outbox, PendingAttempt } from './outbox';
import type { SyncStatus } from './types';

const BASE_RETRY_MS = 5_000;
const MAX_RETRY_MS = 5 * 60_000;

export interface SyncDependencies {
  api: Pick<ApiClient, 'attempts'>;
  outbox: Outbox;
  onResult(result: AttemptResult): Promise<void>;
  isOnline(): boolean;
  now(): number;
}

/**
 * Drains the outbox in FIFO order. Each submission carries its original
 * clientAttemptId, so a retry after a crash cannot double-count XP.
 */
export class SyncEngine {
  private status: SyncStatus = {
    state: 'idle',
    pending: 0,
    lastSyncedAt: null,
  };

  private readonly listeners = new Set<(status: SyncStatus) => void>();

  constructor(private readonly deps: SyncDependencies) {}

  getStatus(): SyncStatus {
    return this.status;
  }

  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  async enqueue(item: PendingAttempt): Promise<void> {
    await this.deps.outbox.enqueue(item);

    const pending = (await this.deps.outbox.list()).length;
    this.update({ pending });
  }

  async flush(): Promise<SyncStatus> {
    const items = await this.deps.outbox.list();

    if (!this.deps.isOnline()) {
      this.update({ state: 'offline', pending: items.length });

      return this.status;
    }

    if (items.length === 0) {
      this.update({ state: 'idle', pending: 0 });

      return this.status;
    }

    this.update({ state: 'syncing', pending: items.length });

    let failed = false;
    let synced = false;

    for (const item of items) {
      if (item.nextRetryAt && item.nextRetryAt > this.deps.now()) {
        continue;
      }

      try {
        const { clientAttemptId, ...input } = item.localResult;
        const result = await this.deps.api.attempts.submit(
          input,
          item.clientAttemptId,
        );

        await this.deps.onResult(result);
        await this.deps.outbox.remove(item.clientAttemptId);
        synced = true;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          this.update({
            state: 'paused_auth',
            pending: (await this.deps.outbox.list()).length,
            lastError: error.message,
          });

          return this.status;
        }

        if (
          error instanceof ApiError &&
          (error.status === 0 || error.status >= 500)
        ) {
          const retries = item.retries + 1;
          const delay = Math.min(
            BASE_RETRY_MS * 2 ** retries,
            MAX_RETRY_MS,
          );

          await this.deps.outbox.markRetry(
            item.clientAttemptId,
            error.message,
            this.deps.now() + delay,
          );
          failed = true;
          continue;
        }

        await this.deps.outbox.markFailed(
          item.clientAttemptId,
          error instanceof Error ? error.message : 'Sync failed',
        );
        failed = true;
      }
    }

    const pending = (await this.deps.outbox.list()).length;

    this.update({
      state: failed ? 'error' : 'idle',
      pending,
      ...(synced ? { lastSyncedAt: new Date(this.deps.now()).toISOString() } : {}),
    });

    return this.status;
  }

  private update(next: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...next };
    this.listeners.forEach((listener) => listener(this.status));
  }
}
