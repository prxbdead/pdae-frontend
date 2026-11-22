export const DAILY_GOAL_OPTIONS = [10, 30, 50] as const;
export const DEFAULT_DAILY_GOAL = 30;

export interface DailyProgress {
  current: number;
  goal: number;
  percent: number;
  reached: boolean;
}

/** Only the three offered goals are valid; anything else falls back to 30. */
export function clampDailyGoal(xp: number): number {
  return (DAILY_GOAL_OPTIONS as readonly number[]).includes(xp)
    ? xp
    : DEFAULT_DAILY_GOAL;
}

export function dailyProgress(xpToday: number, goal: number): DailyProgress {
  const safeGoal = goal > 0 ? goal : DEFAULT_DAILY_GOAL;
  const current = Math.max(0, xpToday);
  const percent = Math.min(
    100,
    Math.round((current / safeGoal) * 100),
  );

  return {
    current,
    goal: safeGoal,
    percent,
    reached: current >= safeGoal,
  };
}
