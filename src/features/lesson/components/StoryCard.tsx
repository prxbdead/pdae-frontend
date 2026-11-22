import { StyleSheet, Text, View } from 'react-native';

import type { Answer, Exercise } from '@/api/contracts';
import { useTheme } from '@/theme/useTheme';

import { OptionList } from './OptionList';

export type StoryCardExercise = Extract<Exercise, { type: 'story_card' }>;

export interface StoryCardProps {
  exercise: StoryCardExercise;
  answer: Answer | undefined;
  onChange(answer: Answer): void;
  disabled?: boolean;
}

export function StoryCard({
  exercise,
  answer,
  onChange,
  disabled,
}: StoryCardProps) {
  const theme = useTheme();
  const selectedId =
    answer?.type === 'story_card' ? answer.optionId : null;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.body,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.md,
          },
        ]}
      >
        <Text style={[theme.typography.body, { color: theme.colors.text }]}>
          {exercise.body}
        </Text>
      </View>
      <OptionList
        options={exercise.options}
        selectedId={selectedId}
        onSelect={(optionId) => onChange({ type: 'story_card', optionId })}
        disabled={disabled}
        testIDPrefix={`story-option-${exercise.id}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    width: '100%',
  },
  body: {
    borderWidth: 2,
    padding: 16,
  },
});
