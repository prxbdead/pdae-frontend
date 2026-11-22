import NetInfo from '@react-native-community/netinfo';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { useApi } from '@/api/ApiProvider';
import { useProgressStore } from '@/stores/progressStore';

import { Outbox, type PendingAttempt } from './outbox';
import { getSyncStatus, setSyncStatus } from './syncStatusStore';
import { SyncEngine } from './sync';
import { createAsyncStorageKeyValue } from './storage';
import type { SyncStatus } from './types';

export interface SyncApi {
  enqueue(item: PendingAttempt): Promise<void>;
  flush(): Promise<SyncStatus>;
}

const SyncContext = createContext<SyncApi | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { client } = useApi();
  const userId = useProgressStore((state) => state.userId);
  const storage = useMemo(() => createAsyncStorageKeyValue(), []);
  // A plain mutable cell keeps the engine independent of React refs during
  // render while still tracking NetInfo changes.
  const onlineState = useMemo(() => ({ online: true }), []);

  const engine = useMemo(() => {
    if (!userId) {
      return null;
    }

    return new SyncEngine({
      api: client,
      outbox: new Outbox(storage, userId),
      onResult: async () => {
        // Server-authoritative XP and streak reconciliation lands with the
        // result screen; locally applied progress is already written.
      },
      isOnline: () => onlineState.online,
      now: Date.now,
    });
  }, [client, onlineState, storage, userId]);

  useEffect(() => {
    if (!engine) {
      setSyncStatus({ state: 'idle', pending: 0 });

      return;
    }

    const unsubscribeStatus = engine.subscribe((status) =>
      setSyncStatus(status),
    );
    void engine.flush();

    const unsubscribeNet = NetInfo.addEventListener((state) => {
      const reachable = state.isInternetReachable !== false;
      onlineState.online = reachable;

      if (reachable) {
        void engine.flush();
      }
    });

    const appState = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        void engine.flush();
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeNet();
      appState.remove();
    };
  }, [engine, onlineState]);

  const value = useMemo<SyncApi>(
    () => ({
      enqueue: async (item) => {
        await engine?.enqueue(item);
      },
      flush: async () => (engine ? engine.flush() : getSyncStatus()),
    }),
    [engine],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncApi {
  const value = useContext(SyncContext);

  if (!value) {
    throw new Error('useSync must be used inside a SyncProvider');
  }

  return value;
}
