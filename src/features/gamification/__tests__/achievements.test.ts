import type { Achievement } from '@/api/contracts';

import { mergeAchievements } from '../achievements';

function achievement(
  overrides: Partial<Achievement> & { id: string },
): Achievement {
  return {
    title: overrides.id,
    description: 'Description',
    icon: 'star',
    earnedAt: null,
    progress: 0,
    target: 1,
    ...overrides,
  };
}

describe('mergeAchievements', () => {
  it('deduplicates by id and keeps the earliest earned date', () => {
    const merged = mergeAchievements(
      [achievement({ id: 'first', earnedAt: '2026-02-01T00:00:00.000Z' })],
      [achievement({ id: 'first', earnedAt: '2026-01-15T00:00:00.000Z' })],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].earnedAt).toBe('2026-01-15T00:00:00.000Z');
  });

  it('keeps the furthest progress', () => {
    const merged = mergeAchievements(
      [achievement({ id: 'streak', progress: 4, target: 7 })],
      [achievement({ id: 'streak', progress: 6, target: 7 })],
    );

    expect(merged[0].progress).toBe(6);
  });

  it('includes local-only achievements', () => {
    const merged = mergeAchievements(
      [achievement({ id: 'server' })],
      [achievement({ id: 'local' })],
    );

    expect(merged.map((entry) => entry.id).sort()).toEqual(['local', 'server']);
  });

  it('sorts earned badges before locked ones', () => {
    const merged = mergeAchievements(
      [
        achievement({ id: 'locked-a', title: 'Alpha' }),
        achievement({ id: 'earned', title: 'Zulu', earnedAt: '2026-01-01' }),
      ],
      [achievement({ id: 'locked-b', title: 'Beta' })],
    );

    expect(merged.map((entry) => entry.id)).toEqual([
      'earned',
      'locked-a',
      'locked-b',
    ]);
  });
});
