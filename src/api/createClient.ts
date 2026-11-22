import { API_MODE, type ApiMode } from './config';
import type { ApiClient } from './contracts';
import { HttpApiClient } from './http';
import { MockApiClient, setActiveMock } from './mock';

export interface ApiClientBundle {
  client: ApiClient;
  mode: ApiMode;
}

export function createApiClient(mode: ApiMode = API_MODE): ApiClientBundle {
  if (mode === 'http') {
    return { client: new HttpApiClient(), mode };
  }

  const client = new MockApiClient();
  setActiveMock(client);

  return { client, mode };
}
