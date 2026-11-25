import { Platform } from 'react-native';

export type ApiMode = 'mock' | 'http';

/**
 * Android emulators reach the host machine through 10.0.2.2; every other
 * target can use localhost. Point EXPO_PUBLIC_API_URL at another host for a
 * physical device or a deployed backend.
 */
const devHost = Platform.select({
  android: '10.0.2.2',
  default: 'localhost',
});

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${devHost}:5215`;

export const API_MODE: ApiMode =
  process.env.EXPO_PUBLIC_API_MODE === 'http' ? 'http' : 'mock';

export const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

/** Milliseconds before an HTTP request is aborted. */
export const REQUEST_TIMEOUT_MS = 15_000;
