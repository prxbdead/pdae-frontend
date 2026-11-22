import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { Answer, Exercise } from '@/api/contracts';
import { useTheme } from '@/theme/useTheme';

export type FillBlankExercise = Extract<Exercise, { type: 'fill_blank' }>;

export interface FillBlankProps {
  exercise: FillBlankExercise;
  answer: Answer | undefined;
  onChange(answer: Answer): void;
  disabled?: boolean;
}

export function FillBlank({
  exercise,
  answer,
  onChange,
  disabled,
}: FillBlankProps) {
  const theme = useTheme();
  const values = answer?.type === 'fill_blank' ? answer.values : [];

  const setValue = (index: number, text: string) => {
    const next = Array.from(
      { length: exercise.blankCount },
      (_, position) => values[position] ?? '',
    );

    next[index] = text;
    onChange({ type: 'fill_blank', values: next });
  };

  return (
    <View style={styles.form}>
      {exercise.parts.map((part, index) => (
        <View key={`${exercise.id}-part-${index}`} style={styles.part}>
          {part.length > 0 ? (
            <Text
              style={[theme.typography.body, { color: theme.colors.text }]}
            >
              {part}
            </Text>
          ) : null}
          {index < exercise.blankCount ? (
            <TextInput
              accessibilityLabel={`Blank ${index + 1}`}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!disabled}
              onChangeText={(text) => setValue(index, text)}
              placeholder={`Blank ${index + 1}`}
              placeholderTextColor={theme.colors.textMuted}
              testID={`fill-blank-${exercise.id}-${index}`}
              value={values[index] ?? ''}
              style={[
                theme.typography.body,
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radii.sm,
                  color: theme.colors.text,
                },
              ]}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
    width: '100%',
  },
  part: {
    gap: 8,
  },
  input: {
    borderWidth: 2,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
