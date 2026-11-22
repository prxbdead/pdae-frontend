import { useSyncExternalStore } from 'react';

import {
  getSyncStatus,
  subscribeSyncStatus,
} from './syncStatusStore';
import type { SyncStatus } from './types';

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSyncStatus, getSyncStatus, getSyncStatus);
}
