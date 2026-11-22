import type { Achievement } from '@/api/contracts';

function earliestEarnedAt(
  left: string | null,
  right: string | null,
): string | null {
  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return left <= right ? left : right;
}

/**
 * Unions server and locally known achievements by id. The earliest earned date
 * wins, progress takes the furthest value, and earned badges sort before
 * locked ones.
 */
export function mergeAchievements(
  server: Achievement[],
  local: Achievement[],
): Achievement[] {
  const merged = new Map<string, Achievement>();

  const add = (achievement: Achievement) => {
    const existing = merged.get(achievement.id);

    if (!existing) {
      merged.set(achievement.id, achievement);

      return;
    }

    merged.set(achievement.id, {
      ...existing,
      ...achievement,
      earnedAt: earliestEarnedAt(existing.earnedAt, achievement.earnedAt),
      progress: Math.max(existing.progress, achievement.progress),
    });
  };

  server.forEach(add);
  local.forEach(add);

  return [...merged.values()].sort((left, right) => {
    const leftEarned = left.earnedAt !== null;
    const rightEarned = right.earnedAt !== null;

    if (leftEarned !== rightEarned) {
      return leftEarned ? -1 : 1;
    }

    return left.title.localeCompare(right.title);
  });
}
