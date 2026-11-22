import { StyleSheet, Text, View } from 'react-native';

import { Button, Sheet } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

export interface FeedbackSheetProps {
  visible: boolean;
  correct: boolean;
  explanation?: string;
  correctAnswerLabel?: string;
  onContinue(): void;
}

export function FeedbackSheet({
  visible,
  correct,
  explanation,
  correctAnswerLabel,
  onContinue,
}: FeedbackSheetProps) {
  const theme = useTheme();

  return (
    <Sheet visible={visible} title={correct ? 'Correct!' : 'Not quite'}>
      <View
        accessibilityLiveRegion="polite"
        style={[
          styles.banner,
          {
            backgroundColor: correct
              ? theme.colors.success
              : theme.colors.danger,
            borderRadius: theme.radii.md,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.heading,
            {
              color: correct
                ? theme.colors.onSuccess
                : theme.colors.onDanger,
            },
          ]}
        >
          {correct ? 'Nice work.' : 'Here is the idea.'}
        </Text>
      </View>

      {explanation ? (
        <Text style={[theme.typography.body, { color: theme.colors.text }]}>
          {explanation}
        </Text>
      ) : null}

      {!correct && correctAnswerLabel ? (
        <Text
          style={[theme.typography.body, { color: theme.colors.textMuted }]}
        >
          Correct answer: {correctAnswerLabel}
        </Text>
      ) : null}

      <Button label="Continue" onPress={onContinue} fullWidth testID="feedback-continue" />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 12,
  },
});
