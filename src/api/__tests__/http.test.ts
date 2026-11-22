import { ZodError } from 'zod';

import { ApiError } from '../errors';
import { HttpApiClient } from '../http';
import { shouldRetryRequest } from '../queryClient';

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

const client = new HttpApiClient('http://api.test');

describe('HttpApiClient', () => {
  it('maps a 401 to an ApiError with status 401', async () => {
    fetchMock.mockResolvedValue(response({ title: 'Unauthorized' }, 401));

    await expect(client.auth.me()).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
    });
  });

  it('maps a network failure to an ApiError with status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    const error = await client.auth.me().catch((caught) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
  });

  it('rejects a malformed success body with a validation error', async () => {
    fetchMock.mockResolvedValue(response({ nope: true }, 200));

    await expect(client.auth.me()).rejects.toBeInstanceOf(ZodError);
  });

  it('retries 5xx responses but never 4xx', () => {
    expect(shouldRetryRequest(0, new ApiError('Server error', 500))).toBe(true);
    expect(shouldRetryRequest(0, new ApiError('Offline', 0))).toBe(true);
    expect(shouldRetryRequest(0, new ApiError('Not found', 404))).toBe(false);
    expect(shouldRetryRequest(0, new ApiError('Unauthorized', 401))).toBe(
      false,
    );
  });

  it('sends credentials, timezone, and idempotency keys', async () => {
    fetchMock.mockResolvedValue(
      response({
        attemptId: 'attempt-1',
        clientAttemptId: 'client-1',
        lessonId: 'foundations-1-1',
        score: 1,
        passed: true,
        xpEarned: 40,
        hearts: 5,
        streak: {
          current: 1,
          longest: 1,
          lastLessonDate: null,
          freezesEquipped: 0,
          restDay: null,
        },
        newAchievements: [],
      }),
    );

    await client.attempts.submit(
      {
        lessonId: 'foundations-1-1',
        startedAt: '2026-01-01T00:00:00.000Z',
        completedAt: '2026-01-01T00:03:00.000Z',
        answers: [],
        score: 1,
        passed: true,
        xpEarned: 40,
        heartsLost: 0,
        mistakes: [],
      },
      'client-1',
    );

    const [url, init] = fetchMock.mock.calls[0];

    expect(String(url)).toContain('/attempts');
    expect(init.credentials).toBe('include');
    expect(init.headers['Idempotency-Key']).toBe('client-1');
    expect(init.headers['X-Timezone']).toBeTruthy();
  });
});
