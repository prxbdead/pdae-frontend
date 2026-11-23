import { StyleSheet, Text, View } from 'react-native';

import type { LeaderboardTier } from '@/api/contracts';
import { Icon } from '@/components/ui';
import { palette } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

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

/** A rounded shield tile with the tier color and a crown. */
export function TierBadge({ tier, size = 52 }: TierBadgeProps) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${TIER_LABELS[tier]} league badge`}
      testID={`tier-badge-${tier}`}
      style={[
        styles.badge,
        {
          width: size,
          height: size + 4,
          backgroundColor: TIER_COLORS[tier],
          borderBottomLeftRadius: size * 0.46,
          borderBottomRightRadius: size * 0.46,
          borderTopLeftRadius: size * 0.28,
          borderTopRightRadius: size * 0.28,
        },
      ]}
    >
      <Icon name="crown" color={palette.plum} size={size * 0.5} />
      <Text
        style={[
          theme.typography.caption,
          styles.label,
          { color: palette.plum, fontSize: Math.max(10, size * 0.19) },
        ]}
      >
        {TIER_LABELS[tier]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  label: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
