import type { ApiClient } from '@/api/contracts';
import { MockApiClient } from '@/api/mock';

/**
 * Mutable stand-in for the API provider in screen tests.
 * Usage: jest.mock('@/api/ApiProvider', () => require('@/testing/api-mock')).
 */
export const apiMock: { client: ApiClient; mode: 'mock' | 'http' } = {
  client: new MockApiClient(),
  mode: 'mock',
};

export function setApiMockClient(client: ApiClient): void {
  apiMock.client = client;
}

export function resetApiMock(): void {
  apiMock.client = new MockApiClient();
  apiMock.mode = 'mock';
}

export function useApi() {
  return apiMock;
}
