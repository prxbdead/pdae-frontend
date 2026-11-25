import { mockUser } from '@/api/fixtures';
import { ApiError } from '@/api/errors';
import {
  setSessionApi,
  setSessionStorage,
  SESSION_STORAGE_KEY,
  useSessionStore,
} from '@/auth/sessionStore';
import { STORAGE_KEYS } from '@/offline/storage';
import { useProgressStore } from '@/stores/progressStore';
import { MemoryStorage } from '@/testing/memory-storage';

let storage: MemoryStorage;

function seedSession(user = mockUser) {
  return storage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({ user, lastValidatedAt: '2026-11-01T10:00:00.000Z' }),
  );
}

beforeEach(() => {
  storage = new MemoryStorage();
  setSessionStorage(storage);
  setSessionApi(null);
  useSessionStore.setState({
    status: 'loading',
    user: null,
    lastValidatedAt: null,
    isOffline: false,
    returnTo: null,
  });
  useProgressStore.setState({ userId: null });
});

describe('sessionStore', () => {
  it('hydrates a cached session as authenticated', async () => {
    await seedSession();

    await useSessionStore.getState().hydrate();

    const state = useSessionStore.getState();

    expect(state.status).toBe('authenticated');
    expect(state.user?.id).toBe(mockUser.id);
    expect(state.lastValidatedAt).toBe('2026-11-01T10:00:00.000Z');
  });

  it('hydrates as anonymous without a cache', async () => {
    await useSessionStore.getState().hydrate();

    expect(useSessionStore.getState().status).toBe('anonymous');
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('clears the session on a 401 refresh', async () => {
    await seedSession();
    await useSessionStore.getState().hydrate();
    setSessionApi({
      auth: {
        me: jest
          .fn()
          .mockRejectedValue(new ApiError('Unauthorized', 401)),
      },
    } as never);

    await useSessionStore.getState().refresh();

    expect(useSessionStore.getState().status).toBe('anonymous');
    expect(useSessionStore.getState().user).toBeNull();
    expect(await storage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('keeps a cached session and marks offline on a network error', async () => {
    await seedSession();
    await useSessionStore.getState().hydrate();
    setSessionApi({
      auth: {
        me: jest.fn().mockRejectedValue(new ApiError('Offline', 0)),
      },
    } as never);

    await useSessionStore.getState().refresh();

    expect(useSessionStore.getState().status).toBe('authenticated');
    expect(useSessionStore.getState().user?.id).toBe(mockUser.id);
    expect(useSessionStore.getState().isOffline).toBe(true);
  });

  it('expires the session without deleting queued attempts', async () => {
    await seedSession();
    await useSessionStore.getState().hydrate();
    await storage.setItem(STORAGE_KEYS.outbox(mockUser.id), '[]');

    await useSessionStore.getState().expireSession();

    expect(useSessionStore.getState().status).toBe('anonymous');
    expect(await storage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(
      await storage.getItem(STORAGE_KEYS.outbox(mockUser.id)),
    ).not.toBeNull();
  });

  it('returns returnTo exactly once', () => {
    useSessionStore.getState().setReturnTo('/lesson/foundations-1');

    expect(useSessionStore.getState().consumeReturnTo()).toBe(
      '/lesson/foundations-1',
    );
    expect(useSessionStore.getState().consumeReturnTo()).toBeNull();
  });

  it('signs in, persists the session, and scopes progress to the user', async () => {
    await useSessionStore.getState().signIn(mockUser);

    expect(useSessionStore.getState().status).toBe('authenticated');
    expect(await storage.getItem(SESSION_STORAGE_KEY)).toContain(mockUser.email);
    expect(useProgressStore.getState().userId).toBe(mockUser.id);
  });
});
