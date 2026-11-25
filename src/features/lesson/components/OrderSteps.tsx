import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Answer, Exercise } from '@/api/contracts';
import { useTheme } from '@/theme/useTheme';

export type OrderStepsExercise = Extract<Exercise, { type: 'order_steps' }>;

export interface OrderStepsProps {
  exercise: OrderStepsExercise;
  answer: Answer | undefined;
  onChange(answer: Answer): void;
  disabled?: boolean;
}

/**
 * The pack lists steps in the correct order, so the learner starts from a
 * rotated order. Reordering with the up/down buttons makes the answer real
 * without requiring drag.
 */
function initialOrder(ids: string[]): string[] {
  if (ids.length < 2) {
    return ids;
  }

  return [...ids.slice(1), ids[0]];
}

export function OrderSteps({
  exercise,
  answer,
  onChange,
  disabled,
}: OrderStepsProps) {
  const theme = useTheme();
  const ids =
    answer?.type === 'order_steps' &&
    answer.stepIds.length === exercise.steps.length
      ? answer.stepIds
      : initialOrder(exercise.steps.map((step) => step.id));

  const move = (index: number, delta: number) => {
    const target = index + delta;

    if (target < 0 || target >= ids.length) {
      return;
    }

    const next = [...ids];

    [next[index], next[target]] = [next[target], next[index]];
    onChange({ type: 'order_steps', stepIds: next });
  };

  return (
    <View style={styles.list}>
      {ids.map((id, index) => {
        const step = exercise.steps.find((entry) => entry.id === id);
        const text = step?.text ?? id;

        return (
          <View
            key={id}
            style={[
              styles.row,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.sm,
              },
            ]}
          >
            <Text
              style={[theme.typography.caption, { color: theme.colors.textMuted }]}
            >
              Step {index + 1} of {ids.length}
            </Text>
            <Text
              style={[
                theme.typography.body,
                styles.text,
                { color: theme.colors.text },
              ]}
            >
              {text}
            </Text>
            <View style={styles.controls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Move ${text} up`}
                accessibilityState={{ disabled: disabled || index === 0 }}
                disabled={disabled || index === 0}
                onPress={() => move(index, -1)}
                testID={`order-up-${id}`}
                style={[
                  styles.control,
                  {
                    borderColor: theme.colors.border,
                    borderRadius: theme.radii.sm,
                    opacity: disabled || index === 0 ? 0.4 : 1,
                  },
                ]}
              >
                <Text
                  style={[theme.typography.body, { color: theme.colors.text }]}
                >
                  ↑
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Move ${text} down`}
                accessibilityState={{
                  disabled: disabled || index === ids.length - 1,
                }}
                disabled={disabled || index === ids.length - 1}
                onPress={() => move(index, 1)}
                testID={`order-down-${id}`}
                style={[
                  styles.control,
                  {
                    borderColor: theme.colors.border,
                    borderRadius: theme.radii.sm,
                    opacity: disabled || index === ids.length - 1 ? 0.4 : 1,
                  },
                ]}
              >
                <Text
                  style={[theme.typography.body, { color: theme.colors.text }]}
                >
                  ↓
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    width: '100%',
  },
  row: {
    borderWidth: 2,
    gap: 6,
    padding: 12,
  },
  text: {
    flexShrink: 1,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  control: {
    alignItems: 'center',
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
