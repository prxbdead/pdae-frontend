import {
  clampDailyGoal,
  dailyProgress,
  DEFAULT_DAILY_GOAL,
} from '../dailyGoal';

describe('clampDailyGoal', () => {
  it('accepts the three offered goals', () => {
    expect(clampDailyGoal(10)).toBe(10);
    expect(clampDailyGoal(30)).toBe(30);
    expect(clampDailyGoal(50)).toBe(50);
  });

  it('falls back to thirty for anything else', () => {
    expect(clampDailyGoal(20)).toBe(DEFAULT_DAILY_GOAL);
    expect(clampDailyGoal(0)).toBe(DEFAULT_DAILY_GOAL);
    expect(clampDailyGoal(100)).toBe(DEFAULT_DAILY_GOAL);
  });
});

describe('dailyProgress', () => {
  it('reports the fraction of the goal', () => {
    expect(dailyProgress(15, 30)).toEqual({
      current: 15,
      goal: 30,
      percent: 50,
      reached: false,
    });
  });

  it('caps the percent at 100', () => {
    expect(dailyProgress(60, 50)).toMatchObject({
      percent: 100,
      reached: true,
    });
  });

  it('is reached when XP equals the goal', () => {
    expect(dailyProgress(30, 30)).toMatchObject({
      percent: 100,
      reached: true,
    });
    expect(dailyProgress(29, 30)).toMatchObject({ reached: false });
  });

  it('falls back to the default goal when the goal is zero', () => {
    expect(dailyProgress(10, 0)).toMatchObject({
      goal: DEFAULT_DAILY_GOAL,
    });
  });
});
