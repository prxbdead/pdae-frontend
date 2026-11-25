import { StyleSheet, Text, View } from 'react-native';

import { Artwork, Button } from '@/components/ui';
import { ledgeColors, textVariants } from '@/theme/tokens';
import { useSafeInsets } from '@/theme/useSafeInsets';
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
  const insets = useSafeInsets();

  if (!visible) {
    return null;
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      testID="feedback-panel"
      style={[
        styles.panel,
        {
          backgroundColor: correct
            ? theme.colors.successSoft
            : theme.colors.dangerSoft,
          borderColor: correct ? ledgeColors.mint : ledgeColors.coral,
          borderTopLeftRadius: theme.radii.lg,
          borderTopRightRadius: theme.radii.lg,
          paddingBottom: theme.spacing.md + insets.bottom,
          paddingTop: theme.spacing.md,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          { gap: theme.spacing.sm, maxWidth: theme.breakpoints.lessonWidth },
        ]}
      >
        <View style={[styles.titleRow, { gap: theme.spacing.sm }]}>
          <Artwork name={correct ? 'correct' : 'wrong'} size={40} />
          <Text style={[theme.typography.title, { color: theme.colors.text }]}>
            {correct ? 'Correct!' : 'Not quite'}
          </Text>
        </View>

        {explanation ? (
          <Text style={[theme.typography.body, { color: theme.colors.text }]}>
            {explanation}
          </Text>
        ) : null}

        {!correct && correctAnswerLabel ? (
          <Text style={[textVariants.bodyStrong, { color: theme.colors.text }]}>
            Correct answer: {correctAnswerLabel}
          </Text>
        ) : null}

        <Button
          label="Continue"
          onPress={onContinue}
          variant={correct ? 'primary' : 'danger'}
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
    borderTopWidth: 2,
    width: '100%',
  },
  inner: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
