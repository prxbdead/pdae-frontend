import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, EmptyState, PageHeader, Skeleton } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import { useLesson } from '@/features/lesson/useLesson';
import { useProgressStore } from '@/stores/progressStore';
import { useTheme } from '@/theme/useTheme';

export default function LessonIntroScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { lesson, module, isLoading, error, retry } = useLesson(lessonId);
  const progress = useProgressStore((state) => state.lessons[lessonId]);
  const completed = progress?.status === 'completed';

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <PageHeader
        title="Lesson"
        tier="compact"
        onBack={() => router.back()}
      />

      {isLoading ? (
        <View style={styles.loading}>
          <Skeleton height={160} radius={theme.radii.lg} />
          <Skeleton height={28} width="70%" />
          <Skeleton height={16} />
          <Skeleton height={16} width="85%" />
        </View>
      ) : error || !lesson ? (
        <EmptyState
          icon="book"
          title="Couldn't open this lesson"
          message="The lessons on this device could not be read."
          actionLabel="Retry"
          onAction={retry}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radii.lg,
              },
            ]}
          >
            <Mascot
              character={module?.teacherCharacterId ?? 'hodlo'}
              mood="happy"
              size="lg"
            />
          </View>

          <Text
            style={[theme.typography.title, { color: theme.colors.text }]}
          >
            {lesson.title}
          </Text>
          <Text
            style={[theme.typography.body, { color: theme.colors.textMuted }]}
          >
            {lesson.description}
          </Text>

          <View style={styles.meta}>
            <Text
              style={[theme.typography.caption, { color: theme.colors.text }]}
            >
              {lesson.exercises.length} questions
            </Text>
            <Text
              style={[theme.typography.caption, { color: theme.colors.text }]}
            >
              {lesson.estimatedMinutes} min
            </Text>
            {lesson.xpReward > 0 ? (
              <Text
                style={[theme.typography.caption, { color: theme.colors.text }]}
              >
                {lesson.xpReward} XP
              </Text>
            ) : null}
          </View>

          <Button
            label={completed ? 'Practice again' : 'Start lesson'}
            onPress={() => router.push(`/lesson/${lesson.id}/play`)}
            size="lg"
            fullWidth
            testID="start-lesson"
          />
          <Button
            label="Back to Learn"
            onPress={() => router.dismissTo('/(tabs)/learn')}
            variant="secondary"
            fullWidth
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    gap: 16,
    padding: 24,
  },
  content: {
    alignSelf: 'center',
    gap: 16,
    maxWidth: 600,
    padding: 24,
    paddingBottom: 48,
    width: '100%',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingVertical: 24,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
});
