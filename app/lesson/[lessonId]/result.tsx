import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, EmptyState, PageHeader } from '@/components/ui';
import { useSyncStatus } from '@/offline/useSyncStatus';
import { useProgressStore } from '@/stores/progressStore';
import { useTheme } from '@/theme/useTheme';

/**
 * Minimal result view for the playable-lesson milestone. Task 13 replaces it
 * with the animated XP/streak/daily-goal result screen.
 */
export default function LessonResultScreen() {
  const { lessonId, attemptId } = useLocalSearchParams<{
    lessonId: string;
    attemptId?: string;
  }>();
  const router = useRouter();
  const theme = useTheme();
  const sync = useSyncStatus();
  const lastResult = useProgressStore((state) => state.lastResult);

  const result =
    lastResult &&
    lastResult.lessonId === lessonId &&
    (!attemptId || lastResult.clientAttemptId === attemptId)
      ? lastResult
      : null;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <PageHeader title="Lesson result" tier="compact" />

      {!result ? (
        <EmptyState
          icon="book"
          title="Result unavailable"
          message="This attempt is not on this device. Your progress is still saved."
          actionLabel="Back to Learn"
          onAction={() => router.dismissTo('/(tabs)/learn')}
        />
      ) : (
        <View style={styles.content}>
          <Text
            style={[theme.typography.display, { color: theme.colors.text }]}
          >
            {result.passed ? 'Lesson complete' : 'Keep practicing'}
          </Text>

          <View style={styles.stats}>
            <Text
              style={[theme.typography.heading, { color: theme.colors.text }]}
            >
              {Math.round(result.score * 100)}% accurate
            </Text>
            <Text
              style={[theme.typography.heading, { color: theme.colors.text }]}
            >
              +{result.xpEarned} XP
            </Text>
          </View>

          {sync.pending > 0 ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                theme.typography.body,
                { color: theme.colors.textMuted },
              ]}
            >
              Saved offline — XP and streak will sync when you&apos;re back
              online.
            </Text>
          ) : null}

          <Button
            label="Continue"
            onPress={() => router.dismissTo('/(tabs)/learn')}
            size="lg"
            fullWidth
            testID="result-continue"
          />
          <Button
            label="Retry lesson"
            onPress={() => router.replace(`/lesson/${lessonId}`)}
            variant="secondary"
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    gap: 20,
    maxWidth: 600,
    padding: 24,
    width: '100%',
  },
  stats: {
    gap: 8,
  },
});
