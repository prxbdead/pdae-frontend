import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { EmptyState, PageHeader } from '@/components/ui';
import { useContent } from '@/content/ContentProvider';
import {
  buildMistakesLesson,
  MISTAKES_LESSON_ID,
} from '@/features/practice/usePracticeData';
import { useProgressStore } from '@/stores/progressStore';
import { useTheme } from '@/theme/useTheme';

type Status = 'loading' | 'empty' | 'error';

/**
 * Builds a temporary lesson from the learner's mistake ids, registers it with
 * the content repository, then opens the normal lesson intro.
 */
export default function MistakesRoute() {
  const router = useRouter();
  const theme = useTheme();
  const repository = useContent();
  const mistakeIds = useProgressStore((state) => state.mistakeIds ?? []);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const pack = await repository.getPack();
        const lesson = buildMistakesLesson(pack, mistakeIds);

        if (!active) {
          return;
        }

        if (!lesson) {
          setStatus('empty');

          return;
        }

        repository.registerSynthetic(lesson);
        router.replace(`/lesson/${MISTAKES_LESSON_ID}`);
      } catch {
        if (active) {
          setStatus('error');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [attempt, mistakeIds, repository, router]);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ContentColumn>
      <PageHeader
        title="Mistakes review"
        tier="compact"
        onBack={() => router.back()}
      />

      {status === 'loading' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : status === 'error' ? (
        <EmptyState
          icon="practice"
          title="Couldn't open your mistakes"
          message="The downloaded lessons could not be read from this device."
          actionLabel="Retry"
          onAction={() => {
            setStatus('loading');
            setAttempt((value) => value + 1);
          }}
        />
      ) : (
        <EmptyState
          character="hodlo"
          icon="practice"
          title="No mistakes to review"
          message="Miss a question in a lesson and it will wait for you here."
          actionLabel="Back to Practice"
          onAction={() => router.dismissTo('/(tabs)/practice')}
        />
      )}
      </ContentColumn>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
