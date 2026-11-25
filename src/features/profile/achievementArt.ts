import type { Achievement } from '@/api/contracts';
import type { ArtworkName } from '@/components/ui';

const ACHIEVEMENT_ART: Record<string, ArtworkName> = {
  'first-steps': 'achievement-first-steps',
  'seven-day-streak': 'achievement-seven-day-streak',
  'perfect-lesson': 'achievement-perfect-lesson',
  'risk-aware': 'achievement-risk-aware',
  'scam-spotter': 'achievement-scam-spotter',
  'chart-reader': 'achievement-chart-reader',
  'compounder': 'achievement-compounder',
  'key-keeper': 'achievement-key-keeper',
  'daily-goal': 'achievement-daily-goal',
  'unit-cleared': 'achievement-unit-cleared',
  'comeback': 'achievement-comeback',
  'team-player': 'achievement-team-player',
};

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Picks the illustrated medal for an achievement. It matches on the id
 * (ignoring the local- prefix) and then on the title, so server and locally
 * derived achievements share the same art. Unknown ones get the level coin.
 */
export function achievementArtwork(
  achievement: Pick<Achievement, 'id' | 'title'>,
): ArtworkName {
  return (
    ACHIEVEMENT_ART[slug(achievement.id.replace(/^local-/, ''))] ??
    ACHIEVEMENT_ART[slug(achievement.title)] ??
    'level'
  );
}
