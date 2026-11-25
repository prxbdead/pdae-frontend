const DAY_MS = 86_400_000;

export interface StreakSnapshot {
  current: number;
  longest: number;
  lastLessonDate: string | null;
}

/** `YYYY-MM-DD` in the learner's local time, not UTC. */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseLocalDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);

  if (!match) {
    return null;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/**
 * A day with any completed lesson extends the streak. The same local day never
 * counts twice, yesterday increments, and any larger gap resets to one.
 */
export function computeNextStreak(
  previous: StreakSnapshot,
  now: Date,
): StreakSnapshot {
  const today = toLocalDateKey(now);

  if (previous.lastLessonDate === today) {
    return { ...previous, lastLessonDate: today };
  }

  let current = 1;

  if (previous.lastLessonDate) {
    const last = parseLocalDateKey(previous.lastLessonDate);

    if (last) {
      const days = Math.round(
        (startOfLocalDay(now).getTime() - last.getTime()) / DAY_MS,
      );

      if (days === 1) {
        current = previous.current + 1;
      } else if (days <= 0) {
        // A clock that moved backwards must not reset a real streak.
        current = Math.max(1, previous.current);
      }
    }
  }

  return {
    current,
    longest: Math.max(previous.longest, current),
    lastLessonDate: today,
  };
}
