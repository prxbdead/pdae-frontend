import { computeNextStreak, toLocalDateKey } from '../streak';

function localNoon(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12);
}

const base = {
  current: 3,
  longest: 5,
  lastLessonDate: '2026-11-23',
};

describe('toLocalDateKey', () => {
  it('uses the local calendar day, not UTC', () => {
    expect(toLocalDateKey(localNoon(2026, 1, 5))).toBe('2026-01-05');
    expect(toLocalDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('computeNextStreak', () => {
  it('does not increment twice on the same local day', () => {
    expect(computeNextStreak(base, localNoon(2026, 11, 23))).toEqual(base);
  });

  it('increments on the next day', () => {
    expect(computeNextStreak(base, localNoon(2026, 11, 24))).toEqual({
      current: 4,
      longest: 5,
      lastLessonDate: '2026-11-24',
    });
  });

  it('resets after a gap of two days', () => {
    expect(
      computeNextStreak(
        { current: 4, longest: 9, lastLessonDate: '2026-11-21' },
        localNoon(2026, 11, 24),
      ),
    ).toEqual({
      current: 1,
      longest: 9,
      lastLessonDate: '2026-11-24',
    });
  });

  it('raises the longest streak when the current one passes it', () => {
    expect(
      computeNextStreak(
        { current: 5, longest: 5, lastLessonDate: '2026-11-23' },
        localNoon(2026, 11, 24),
      ),
    ).toEqual({
      current: 6,
      longest: 6,
      lastLessonDate: '2026-11-24',
    });
  });

  it('starts at one with no previous lesson', () => {
    expect(
      computeNextStreak(
        { current: 0, longest: 0, lastLessonDate: null },
        localNoon(2026, 11, 24),
      ),
    ).toEqual({
      current: 1,
      longest: 1,
      lastLessonDate: '2026-11-24',
    });
  });

  it('crosses a month boundary', () => {
    expect(
      computeNextStreak(
        { current: 2, longest: 2, lastLessonDate: '2026-01-31' },
        localNoon(2026, 2, 1),
      ),
    ).toMatchObject({ current: 3, lastLessonDate: '2026-02-01' });
  });

  it('crosses a year boundary', () => {
    expect(
      computeNextStreak(
        { current: 7, longest: 7, lastLessonDate: '2026-12-31' },
        localNoon(2027, 1, 1),
      ),
    ).toMatchObject({ current: 8, lastLessonDate: '2027-01-01' });
  });

  it('does not reset a streak when the clock moves backwards', () => {
    expect(
      computeNextStreak(
        { current: 4, longest: 4, lastLessonDate: '2026-11-25' },
        localNoon(2026, 11, 23),
      ),
    ).toMatchObject({ current: 4, lastLessonDate: '2026-11-23' });
  });
});
