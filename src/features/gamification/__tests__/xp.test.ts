import type { LocalAttemptResult } from '@/offline/types';

import { xpForResult, xpForScore } from '../xp';

describe('xpForScore', () => {
  it('awards ten XP per first-try correct answer', () => {
    expect(xpForScore(0.8, 10, 40)).toBe(80);
  });

  it('adds ten bonus XP for a perfect lesson', () => {
    expect(xpForScore(1, 10, 40)).toBe(110);
  });

  it('gives no bonus below a perfect score', () => {
    expect(xpForScore(0.9, 10, 40)).toBe(90);
  });

  it('awards nothing for a practice lesson', () => {
    expect(xpForScore(1, 10, 0)).toBe(0);
  });

  it('respects the first-try score after a requeued correction', () => {
    // 8 first-try correct of 10: the requeued correction already scored 0.8.
    expect(xpForScore(0.8, 10, 40)).toBe(80);
  });
});

describe('xpForResult', () => {
  it('returns the stored attempt XP', () => {
    const result = { xpEarned: 80 } as LocalAttemptResult;

    expect(xpForResult(result)).toBe(80);
  });
});
