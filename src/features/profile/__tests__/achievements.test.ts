import { buildLocalAchievements } from '../useAchievements';

describe('buildLocalAchievements', () => {
  it('earns first steps and the perfect lesson from local progress', () => {
    const achievements = buildLocalAchievements({
      completedLessons: 2,
      perfectLessons: 1,
      currentStreak: 3,
      xpToday: 20,
      dailyGoalXp: 50,
    });
    const byId = Object.fromEntries(
      achievements.map((achievement) => [achievement.id, achievement]),
    );

    expect(byId['local-first-steps'].earnedAt).not.toBeNull();
    expect(byId['local-perfect-lesson'].earnedAt).not.toBeNull();
    expect(byId['local-seven-day-streak']).toMatchObject({
      earnedAt: null,
      progress: 3,
      target: 7,
    });
    expect(byId['local-daily-goal']).toMatchObject({
      earnedAt: null,
      progress: 20,
      target: 50,
    });
  });

  it('does not earn a badge before its threshold', () => {
    const achievements = buildLocalAchievements({
      completedLessons: 0,
      perfectLessons: 0,
      currentStreak: 0,
      xpToday: 0,
      dailyGoalXp: 30,
    });

    expect(achievements.every((achievement) => achievement.earnedAt === null)).toBe(
      true,
    );
    expect(
      achievements.find((achievement) => achievement.id === 'local-seven-day-streak')
        ?.progress,
    ).toBe(0);
  });
});
