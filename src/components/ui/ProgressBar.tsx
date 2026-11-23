import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: 'purple' | 'mint' | 'yellow' | 'coral';
  label?: string;
  /** Bar thickness in pixels; defaults to 12. */
  height?: number;
}

export function ProgressBar({
  value,
  max = 1,
  tone = 'purple',
  label,
  height = 12,
}: ProgressBarProps) {
  const theme = useTheme();
  const upperBound = max > 0 ? max : 1;
  const clamped = Math.min(Math.max(value, 0), upperBound);
  const percent = (clamped / upperBound) * 100;

  const fill =
    tone === 'mint'
      ? theme.colors.success
      : tone === 'yellow'
        ? theme.colors.warning
        : tone === 'coral'
          ? theme.colors.danger
          : theme.colors.primary;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
          {label}
        </Text>
      ) : null}
      <View
        testID="progress-bar"
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: upperBound, now: clamped }}
        style={[
          styles.track,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radii.pill,
            height,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${percent}%`,
              backgroundColor: fill,
              borderRadius: theme.radii.pill,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  track: {
    height: 12,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});
