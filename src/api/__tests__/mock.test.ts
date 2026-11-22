import { mockPack } from '@/content/fixtures/pack';

import type { ApiClient } from '../contracts';
import { ApiError } from '../errors';
import { mockUser } from '../fixtures';
import { createApiClient } from '../index';
import { resetMockApi } from '../mock';

let api: ApiClient;

beforeEach(async () => {
  api = createApiClient().client;
  resetMockApi();
  await api.auth.login({ email: mockUser.email, password: 'password123' });
});

function attemptInput() {
  return {
    lessonId: mockPack.lessons[0].id,
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:03:00.000Z',
    answers: [],
    score: 1,
    passed: true,
    xpEarned: 40,
    heartsLost: 0,
    mistakes: [] as string[],
  };
}

describe('MockApiClient', () => {
  it('returns the mock user on login', async () => {
    const user = await api.auth.me();

    expect(user.id).toBe(mockUser.id);
    expect(user.onboardingCompleted).toBe(false);
  });

  it('rejects me before sign-in', async () => {
    await api.auth.logout();

    await expect(api.auth.me()).rejects.toMatchObject({ status: 401 });
  });

  it('never returns an answer key from getLesson', async () => {
    const lesson = await api.content.getLesson(mockPack.lessons[0].id);

    expect(lesson).not.toHaveProperty('answerKey');
    expect(lesson.exercises.length).toBeGreaterThan(0);
  });

  it('serves the offline pack with answer keys', async () => {
    const pack = await api.content.getOfflinePack();

    expect(pack.lessons[0].answerKey).toBeDefined();
    expect(pack.version).toBe(mockPack.version);
  });

  it('is idempotent for duplicate clientAttemptId submissions', async () => {
    const first = await api.attempts.submit(attemptInput(), 'client-dup');
    const second = await api.attempts.submit(attemptInput(), 'client-dup');

    expect(second).toEqual(first);
    expect(second.xpEarned).toBe(40);
  });

  it('merges profile updates', async () => {
    const updated = await api.profile.update({ displayName: 'New Name' });

    expect(updated.displayName).toBe('New Name');
    expect(updated.email).toBe(mockUser.email);
  });

  it('rejects account deletion with 501', async () => {
    const error = await api.profile.deleteAccount().catch((caught) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(501);
  });

  it('rejects a negative trade quantity', async () => {
    await expect(
      api.trading.placeTrade(
        { symbol: 'BTC', side: 'buy', quantity: -1 },
        'trade-1',
      ),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('returns a weekly leaderboard and achievements', async () => {
    const [leaderboard, achievements] = await Promise.all([
      api.leaderboard.getWeekly(),
      api.achievements.list(),
    ]);

    expect(leaderboard.entries.length).toBe(30);
    expect(achievements).toHaveLength(12);
  });
});
