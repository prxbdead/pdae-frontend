import type { SyncStatus } from './types';

const initialStatus: SyncStatus = {
  state: 'idle',
  pending: 0,
  lastSyncedAt: null,
};

let status: SyncStatus = initialStatus;
const listeners = new Set<(next: SyncStatus) => void>();

export function getSyncStatus(): SyncStatus {
  return status;
}

export function setSyncStatus(next: Partial<SyncStatus>): void {
  status = { ...status, ...next };
  listeners.forEach((listener) => listener(status));
}

export function subscribeSyncStatus(
  listener: (next: SyncStatus) => void,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function resetSyncStatus(): void {
  status = initialStatus;
  listeners.forEach((listener) => listener(status));
}
