import { View } from 'react-native';

import type { LeaderboardTier } from '@/api/contracts';
import { Artwork, type ArtworkName } from '@/components/ui';

/**
 * League-only colors. Everything else stays on the core palette.
 */
export const TIER_COLORS: Record<LeaderboardTier, string> = {
  bronze: '#C98A5B',
  silver: '#B9C2D0',
  gold: '#FFD84D',
  amethyst: '#B9A8FF',
  diamond: '#7FE7F5',
};

export const TIER_LABELS: Record<LeaderboardTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  amethyst: 'Amethyst',
  diamond: 'Diamond',
};

export interface TierBadgeProps {
  tier: LeaderboardTier;
  size?: number;
}

/** The illustrated shield for a league tier. */
export function TierBadge({ tier, size = 56 }: TierBadgeProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${TIER_LABELS[tier]} league badge`}
      testID={`tier-badge-${tier}`}
    >
      <Artwork name={`tier-${tier}` as ArtworkName} size={size} />
    </View>
  );
}
