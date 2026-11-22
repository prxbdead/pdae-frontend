import { StyleSheet, Text, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';

import { useTheme } from '@/theme/useTheme';

export interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  tone?: 'purple' | 'mint' | 'yellow';
  label?: string;
}

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  tone = 'purple',
  label,
}: ProgressRingProps) {
  const theme = useTheme();
  const clamped = Math.min(Math.max(value, 0), 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const stroke =
    tone === 'mint'
      ? theme.colors.success
      : tone === 'yellow'
        ? theme.colors.warning
        : theme.colors.primary;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 1, now: clamped }}
      accessibilityLabel={label}
      style={[styles.wrapper, { width: size, height: size }]}
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        testID="progress-ring"
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.surfaceAlt}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {label ? (
        <View style={styles.label}>
          <Text style={[theme.typography.caption, { color: theme.colors.text }]}>
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
