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
              minWidth: percent > 0 ? 12 : 0,
              backgroundColor: fill,
              borderRadius: theme.radii.pill,
            },
          ]}
        >
          {percent > 0 ? <View style={styles.highlight} /> : null}
        </View>
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
    paddingTop: 3,
  },
  highlight: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 999,
    height: 3,
    marginHorizontal: 6,
  },
});
