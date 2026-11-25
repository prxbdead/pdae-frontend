import { Image } from 'expo-image';

export type ArtworkName =
  | 'profile'
  | 'bolt'
  | 'book'
  | 'chest'
  | 'diamond'
  | 'practice'
  | 'fire'
  | 'freeze'
  | 'heart'
  | 'level'
  | 'completed'
  | 'perfect'
  | 'locked'
  | 'shield'
  | 'shop'
  | 'settings'
  | 'chart'
  | 'wallet'
  | 'key'
  | 'search'
  | 'correct'
  | 'wrong'
  | 'leagues'
  | 'achievement-first-steps'
  | 'achievement-seven-day-streak'
  | 'achievement-perfect-lesson'
  | 'achievement-risk-aware'
  | 'achievement-scam-spotter'
  | 'achievement-chart-reader'
  | 'achievement-compounder'
  | 'achievement-key-keeper'
  | 'achievement-daily-goal'
  | 'achievement-unit-cleared'
  | 'achievement-comeback'
  | 'achievement-team-player'
  | 'tier-bronze'
  | 'tier-silver'
  | 'tier-gold'
  | 'tier-amethyst'
  | 'tier-diamond';

const SOURCES: Record<ArtworkName, number> = {
  profile: require('../../../assets/artwork/profile.svg'),
  bolt: require('../../../assets/artwork/bolt.svg'),
  book: require('../../../assets/artwork/book.svg'),
  chest: require('../../../assets/artwork/chest.svg'),
  diamond: require('../../../assets/artwork/diamond.svg'),
  practice: require('../../../assets/artwork/practice.svg'),
  fire: require('../../../assets/artwork/fire.svg'),
  freeze: require('../../../assets/artwork/freeze.svg'),
  heart: require('../../../assets/artwork/heart.svg'),
  level: require('../../../assets/artwork/level.svg'),
  completed: require('../../../assets/artwork/completed.svg'),
  perfect: require('../../../assets/artwork/perfect.svg'),
  locked: require('../../../assets/artwork/locked.svg'),
  shield: require('../../../assets/artwork/shield.svg'),
  shop: require('../../../assets/artwork/shop.svg'),
  settings: require('../../../assets/artwork/settings.svg'),
  chart: require('../../../assets/artwork/chart.svg'),
  wallet: require('../../../assets/artwork/wallet.svg'),
  key: require('../../../assets/artwork/key.svg'),
  search: require('../../../assets/artwork/search.svg'),
  correct: require('../../../assets/artwork/correct.svg'),
  wrong: require('../../../assets/artwork/wrong.svg'),
  leagues: require('../../../assets/artwork/leagues.svg'),
  'achievement-first-steps': require('../../../assets/artwork/achievement-first-steps.svg'),
  'achievement-seven-day-streak': require('../../../assets/artwork/achievement-seven-day-streak.svg'),
  'achievement-perfect-lesson': require('../../../assets/artwork/achievement-perfect-lesson.svg'),
  'achievement-risk-aware': require('../../../assets/artwork/achievement-risk-aware.svg'),
  'achievement-scam-spotter': require('../../../assets/artwork/achievement-scam-spotter.svg'),
  'achievement-chart-reader': require('../../../assets/artwork/achievement-chart-reader.svg'),
  'achievement-compounder': require('../../../assets/artwork/achievement-compounder.svg'),
  'achievement-key-keeper': require('../../../assets/artwork/achievement-key-keeper.svg'),
  'achievement-daily-goal': require('../../../assets/artwork/achievement-daily-goal.svg'),
  'achievement-unit-cleared': require('../../../assets/artwork/achievement-unit-cleared.svg'),
  'achievement-comeback': require('../../../assets/artwork/achievement-comeback.svg'),
  'achievement-team-player': require('../../../assets/artwork/achievement-team-player.svg'),
  'tier-bronze': require('../../../assets/artwork/tier-bronze.svg'),
  'tier-silver': require('../../../assets/artwork/tier-silver.svg'),
  'tier-gold': require('../../../assets/artwork/tier-gold.svg'),
  'tier-amethyst': require('../../../assets/artwork/tier-amethyst.svg'),
  'tier-diamond': require('../../../assets/artwork/tier-diamond.svg'),
};

export interface ArtworkProps {
  name: ArtworkName;
  size?: number;
  width?: number;
  height?: number;
  testID?: string;
}

/** Renders the original multicolor SVG artwork supplied for Hodlo. */
export function Artwork({ name, size = 24, width = size, height = size, testID }: ArtworkProps) {
  return (
    <Image
      source={SOURCES[name]}
      contentFit="contain"
      style={{ width, height }}
      testID={testID}
    />
  );
}
