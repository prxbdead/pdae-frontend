import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './errors';

/**
 * Retry only transient failures. A 4xx answer will not change on retry, and
 * auth errors must reach the session layer untouched.
 */
export function shouldRetryRequest(
  failureCount: number,
  error: unknown,
): boolean {
  if (error instanceof ApiError) {
    if (error.status === 0 || error.status >= 500) {
      return failureCount < 3;
    }

    return false;
  }

  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      staleTime: 30_000,
      retry: shouldRetryRequest,
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: false,
    },
  },
});
