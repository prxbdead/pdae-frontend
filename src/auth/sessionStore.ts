import { create } from 'zustand';

import type { ApiClient, UserProfile } from '@/api/contracts';
import { ApiError } from '@/api/errors';
import { queryClient } from '@/api/queryClient';
import {
  clearUserData,
  createAsyncStorageKeyValue,
  readJson,
  STORAGE_KEYS,
  writeJson,
  type KeyValueStorage,
} from '@/offline/storage';
import { useProgressStore } from '@/stores/progressStore';

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

export const SESSION_STORAGE_KEY = STORAGE_KEYS.session;

interface PersistedSession {
  user: UserProfile;
  lastValidatedAt: string | null;
}

type AuthApi = Pick<ApiClient, 'auth'>;

export interface SessionState {
  status: SessionStatus;
  user: UserProfile | null;
  lastValidatedAt: string | null;
  isOffline: boolean;
  returnTo: string | null;
  signIn(user: UserProfile): Promise<void>;
  updateUser(user: UserProfile): void;
  signOut(): Promise<void>;
  expireSession(): Promise<void>;
  hydrate(): Promise<void>;
  refresh(): Promise<void>;
  setReturnTo(path: string): void;
  consumeReturnTo(): string | null;
}

let storage: KeyValueStorage = createAsyncStorageKeyValue();
let authApi: AuthApi | null = null;

/** Test seam: swap the session storage backend. */
export function setSessionStorage(next: KeyValueStorage): void {
  storage = next;
}

/** Test seam: the provider installs the API before hydrate/refresh run. */
export function setSessionApi(next: AuthApi | null): void {
  authApi = next;
}

async function persistSession(
  user: UserProfile,
  lastValidatedAt: string | null,
): Promise<void> {
  await writeJson(storage, STORAGE_KEYS.session, {
    user,
    lastValidatedAt,
  } satisfies PersistedSession);
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  status: 'loading',
  user: null,
  lastValidatedAt: null,
  isOffline: false,
  returnTo: null,

  signIn: async (user) => {
    const now = new Date().toISOString();

    set({
      status: 'authenticated',
      user,
      lastValidatedAt: now,
      isOffline: false,
    });

    await persistSession(user, now);
    await useProgressStore
      .getState()
      .setUser(user.id, user.dailyGoalXp);
  },

  updateUser: (user) => {
    if (get().status !== 'authenticated') {
      return;
    }

    set({ user, isOffline: false });
    void persistSession(user, get().lastValidatedAt);
  },

  signOut: async () => {
    const userId = get().user?.id;

    try {
      await authApi?.auth.logout();
    } catch {
      // Signing out locally always succeeds; the cookie will expire server-side.
    }

    set({
      status: 'anonymous',
      user: null,
      lastValidatedAt: null,
      isOffline: false,
      returnTo: null,
    });
    await storage.removeItem(STORAGE_KEYS.session);

    useProgressStore.getState().clear();
    queryClient.clear();

    if (userId) {
      await clearUserData(storage, userId);
    }
  },

  expireSession: async () => {
    // Keep progress, outbox, and the query cache: queued attempts are replayed
    // after the user signs in again.
    set({
      status: 'anonymous',
      user: null,
      lastValidatedAt: null,
      isOffline: false,
    });
    await storage.removeItem(STORAGE_KEYS.session);
  },

  hydrate: async () => {
    const cached = await readJson<PersistedSession>(
      storage,
      STORAGE_KEYS.session,
    );

    if (!cached?.user) {
      set({ status: 'anonymous', user: null, lastValidatedAt: null });

      return;
    }

    set({
      status: 'authenticated',
      user: cached.user,
      lastValidatedAt: cached.lastValidatedAt,
    });
    await useProgressStore
      .getState()
      .setUser(cached.user.id, cached.user.dailyGoalXp);
  },

  refresh: async () => {
    const { user } = get();

    if (!user) {
      if (get().status === 'loading') {
        set({ status: 'anonymous' });
      }

      return;
    }

    if (!authApi) {
      return;
    }

    try {
      const fresh = await authApi.auth.me();
      const now = new Date().toISOString();

      set({
        status: 'authenticated',
        user: fresh,
        lastValidatedAt: now,
        isOffline: false,
      });
      await persistSession(fresh, now);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await get().expireSession();

        return;
      }

      set({ isOffline: true });
    }
  },

  setReturnTo: (path) => set({ returnTo: path }),

  consumeReturnTo: () => {
    const { returnTo } = get();

    set({ returnTo: null });

    return returnTo;
  },
}));
