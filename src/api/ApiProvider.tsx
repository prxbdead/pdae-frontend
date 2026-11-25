import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { createApiClient, type ApiClientBundle } from './createClient';
import { queryClient } from './queryClient';

export const QUERY_CACHE_KEY = 'hodlo:v1:query-cache';

const ApiContext = createContext<ApiClientBundle | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const bundle = useMemo(() => createApiClient(), []);
  const persister = useMemo(
    () =>
      createAsyncStoragePersister({
        storage: AsyncStorage,
        key: QUERY_CACHE_KEY,
      }),
    [],
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 7 * 24 * 60 * 60 * 1000 }}
    >
      <ApiContext.Provider value={bundle}>{children}</ApiContext.Provider>
    </PersistQueryClientProvider>
  );
}

export function useApi(): ApiClientBundle {
  const value = useContext(ApiContext);

  if (!value) {
    throw new Error('useApi must be used inside an ApiProvider');
  }

  return value;
}
