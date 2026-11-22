import AsyncStorage from '@react-native-async-storage/async-storage';

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const STORAGE_KEYS = {
  contentPack: 'hodlo:v1:content-pack',
  progress: (userId: string) => `hodlo:v1:progress:${userId}`,
  outbox: (userId: string) => `hodlo:v1:outbox:${userId}`,
  lessonSession: 'hodlo:v1:lesson-session',
  settings: 'hodlo:v1:settings',
  queryCache: 'hodlo:v1:query-cache',
} as const;

export function createAsyncStorageKeyValue(): KeyValueStorage {
  return AsyncStorage;
}

export async function readJson<T>(
  storage: KeyValueStorage,
  key: string,
): Promise<T | null> {
  const raw = await storage.getItem(key);

  if (raw === null) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJson(
  storage: KeyValueStorage,
  key: string,
  value: unknown,
): Promise<void> {
  await storage.setItem(key, JSON.stringify(value));
}

/**
 * Removes everything scoped to one user. The content pack and settings stay so
 * the next launch still works offline and keeps the device preferences.
 */
export async function clearUserData(
  storage: KeyValueStorage,
  userId: string,
): Promise<void> {
  await Promise.all([
    storage.removeItem(STORAGE_KEYS.progress(userId)),
    storage.removeItem(STORAGE_KEYS.outbox(userId)),
    storage.removeItem(STORAGE_KEYS.lessonSession),
    storage.removeItem(STORAGE_KEYS.queryCache),
  ]);
}
