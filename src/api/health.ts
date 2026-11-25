import { API_BASE_URL } from './config';

export { API_BASE_URL };

export type HealthResponse = {
  status: string;
  timestamp: string;
};

/** Development-only backend reachability check used by /dev/health. */
export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`API responded with ${response.status}`);
  }

  return response.json();
}
