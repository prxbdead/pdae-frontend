import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
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

  if (!visible) {
    return null;
  }

  const ink = correct ? theme.colors.onSuccess : theme.colors.onDanger;

  return (
    <View
      accessibilityLiveRegion="polite"
      testID="feedback-panel"
      style={[
        styles.panel,
        {
          backgroundColor: correct
            ? theme.colors.success
            : theme.colors.danger,
          borderTopLeftRadius: theme.radii.lg,
          borderTopRightRadius: theme.radii.lg,
        },
      ]}
    >
      <View
        style={[styles.inner, { maxWidth: theme.breakpoints.lessonWidth }]}
      >
        <Text style={[theme.typography.title, { color: ink }]}>
          {correct ? 'Correct!' : 'Not quite'}
        </Text>

        {explanation ? (
          <Text style={[theme.typography.body, styles.copy, { color: ink }]}>
            {explanation}
          </Text>
        ) : null}

        {!correct && correctAnswerLabel ? (
          <Text
            style={[theme.typography.body, styles.answer, { color: ink }]}
          >
            Correct answer: {correctAnswerLabel}
          </Text>
        ) : null}

        <Button
          label="Continue"
          onPress={onContinue}
          variant="contrast"
          size="lg"
          fullWidth
          testID="feedback-continue"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingBottom: 20,
    paddingTop: 20,
    width: '100%',
  },
  inner: {
    alignSelf: 'center',
    gap: 10,
    paddingHorizontal: 16,
    width: '100%',
  },
  copy: {
    opacity: 0.95,
  },
  answer: {
    fontWeight: '800',
  },
});
