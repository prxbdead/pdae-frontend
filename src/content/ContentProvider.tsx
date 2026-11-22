import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useApi } from '@/api/ApiProvider';
import { createAsyncStorageKeyValue } from '@/offline/storage';

import { mockPack } from './fixtures/pack';
import { ContentRepository } from './repository';

const ContentContext = createContext<ContentRepository | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const { client } = useApi();

  const repository = useMemo(
    () =>
      new ContentRepository(
        createAsyncStorageKeyValue(),
        mockPack,
        client.content,
      ),
    [client],
  );

  return (
    <ContentContext.Provider value={repository}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent(): ContentRepository {
  const value = useContext(ContentContext);

  if (!value) {
    throw new Error('useContent must be used inside a ContentProvider');
  }

  return value;
}
