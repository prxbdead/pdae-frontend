import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Answer, Exercise } from '@/api/contracts';
import { useTheme } from '@/theme/useTheme';

export type TrueFalseExercise = Extract<Exercise, { type: 'true_false' }>;

export interface TrueFalseProps {
  exercise: TrueFalseExercise;
  answer: Answer | undefined;
  onChange(answer: Answer): void;
  disabled?: boolean;
}

const CHOICES = [
  { value: true, label: 'True' },
  { value: false, label: 'False' },
] as const;

export function TrueFalse({
  exercise,
  answer,
  onChange,
  disabled,
}: TrueFalseProps) {
  const theme = useTheme();
  const selected =
    answer?.type === 'true_false' ? answer.value : undefined;

  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.row, disabled && styles.disabled]}
    >
      {CHOICES.map((choice) => {
        const isSelected = selected === choice.value;

        return (
          <Pressable
            key={choice.label}
            accessibilityRole="radio"
            accessibilityLabel={choice.label}
            accessibilityState={{ selected: isSelected, disabled }}
            disabled={disabled}
            onPress={() => onChange({ type: 'true_false', value: choice.value })}
            testID={`true-false-${exercise.id}-${choice.label.toLowerCase()}`}
            style={[
              styles.choice,
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
              style={[
                theme.typography.heading,
                { color: theme.colors.text },
              ]}
            >
              {choice.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  disabled: {
    opacity: 0.7,
  },
  choice: {
    alignItems: 'center',
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 88,
    padding: 16,
  },
});
