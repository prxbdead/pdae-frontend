import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import type { Answer, Exercise } from '@/api/contracts';
import { useTheme } from '@/theme/useTheme';

export type DcaTimelineExercise = Extract<Exercise, { type: 'dca_timeline' }>;

export interface DcaTimelineProps {
  exercise: DcaTimelineExercise;
  answer: Answer | undefined;
  onChange(answer: Answer): void;
  disabled?: boolean;
}

const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 90;
const PADDING = 12;

const LABELS: Record<'buy' | 'hold' | 'sell', string> = {
  buy: 'Buy',
  hold: 'Hold',
  sell: 'Sell',
};

export function DcaTimeline({
  exercise,
  answer,
  onChange,
  disabled,
}: DcaTimelineProps) {
  const theme = useTheme();
  const selected = answer?.type === 'dca_timeline' ? answer.action : null;
  const max = Math.max(...exercise.prices);
  const min = Math.min(...exercise.prices);
  const range = max - min || 1;
  const step = (VIEW_WIDTH - PADDING * 2) / Math.max(exercise.prices.length - 1, 1);

  const points = exercise.prices
    .map((price, index) => {
      const x = PADDING + step * index;
      const y = PADDING + ((max - price) / range) * (VIEW_HEIGHT - PADDING * 2);

      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={styles.container}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Price chart with ${exercise.prices.length} points`}
      >
        <Svg
          width="100%"
          height={VIEW_HEIGHT}
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        >
          <Polyline
            points={points}
            fill="none"
            stroke={theme.colors.primary}
            strokeWidth={3}
          />
        </Svg>
      </View>

      <View
        accessibilityRole="radiogroup"
        style={styles.actions}
      >
        {(['buy', 'hold', 'sell'] as const).map((action) => {
          const isSelected = selected === action;

          return (
            <Pressable
              key={action}
              accessibilityRole="radio"
              accessibilityLabel={LABELS[action]}
              accessibilityState={{ selected: isSelected, disabled }}
              disabled={disabled}
              onPress={() => onChange({ type: 'dca_timeline', action })}
              testID={`dca-${action}`}
              style={[
                styles.action,
                {
                  backgroundColor: isSelected
                    ? theme.colors.secondary
                    : theme.colors.surface,
                  borderColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.border,
                  borderRadius: theme.radii.md,
                },
              ]}
            >
              <Text
                style={[theme.typography.button, { color: theme.colors.text }]}
              >
                {LABELS[action]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    alignItems: 'center',
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 64,
  },
});
