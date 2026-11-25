import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useApi } from '@/api/ApiProvider';
import {
  setSessionApi,
  useSessionStore,
} from '@/auth/sessionStore';

/**
 * Restores the cached session, validates it against the API, and re-checks
 * whenever the app returns to the foreground.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { client, mode } = useApi();

  useEffect(() => {
    setSessionApi(client);

    void (async () => {
      await useSessionStore.getState().hydrate();

      // The mock adapter keeps the signed-in user in memory, so a reload
      // would answer `me` with 401 and wipe the cached demo session.
      if (mode !== 'mock') {
        await useSessionStore.getState().refresh();
      }
    })();

    return () => setSessionApi(null);
  }, [client, mode]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active' && mode !== 'mock') {
        void useSessionStore.getState().refresh();
      }
    });

    return () => subscription.remove();
  }, [mode]);

  return children;
}
