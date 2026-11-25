import type { LocalAttemptResult } from '@/offline/types';

export const FIRST_TRY_XP = 10;
export const PERFECT_BONUS_XP = 10;

/**
 * XP is per first-try-correct exercise plus a perfect-lesson bonus. Practice
 * lessons (xpReward 0) never earn XP. `score` already excludes re-queued
 * corrections, so they cannot add XP here either.
 */
export function xpForScore(
  score: number,
  total: number,
  xpReward: number,
): number {
  if (xpReward <= 0 || total <= 0) {
    return 0;
  }

  const firstTryCorrect = Math.round(Math.min(Math.max(score, 0), 1) * total);

  return (
    firstTryCorrect * FIRST_TRY_XP + (score === 1 ? PERFECT_BONUS_XP : 0)
  );
}

export function xpForResult(result: LocalAttemptResult): number {
  return result.xpEarned;
}
