import { Platform } from 'react-native';

/**
 * Base URL of the .NET backend.
 *
 * - Android emulator: 10.0.2.2 maps to the host machine's localhost.
 * - iOS simulator: localhost reaches the host machine directly.
 * - Physical device: replace this with your computer's LAN IP.
 */
const DEV_HOST = Platform.select({
  android: '10.0.2.2',
  default: 'localhost',
});

export const API_BASE_URL = `http://${DEV_HOST}:5215`;

export type HealthResponse = {
  status: string;
  timestamp: string;
};

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`API responded with ${response.status}`);
  }

  return response.json();
}
