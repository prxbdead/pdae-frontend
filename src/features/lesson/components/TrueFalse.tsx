import { StyleSheet, Text, View } from 'react-native';

import type { Answer, Exercise } from '@/api/contracts';
import { Card } from '@/components/ui';
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
          <View key={choice.label} style={styles.choiceCell}>
            <Card
              accessibilityRole="radio"
              accessibilityLabel={choice.label}
              selected={isSelected}
              disabled={disabled}
              onPress={() =>
                onChange({ type: 'true_false', value: choice.value })
              }
              testID={`true-false-${exercise.id}-${choice.label.toLowerCase()}`}
              style={styles.choice}
            >
              <Text
                style={[theme.typography.heading, { color: theme.colors.text }]}
              >
                {choice.label}
              </Text>
            </Card>
          </View>
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
  choiceCell: {
    flex: 1,
  },
  choice: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
});
