import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ContentColumn } from '@/components/layout/ContentColumn';
import type { IconName } from '@/assets/icons';
import {
  Button,
  Card,
  EmptyState,
  Icon,
  PageHeader,
  Skeleton,
} from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import { useLesson } from '@/features/lesson/useLesson';
import { useProgressStore } from '@/stores/progressStore';
import { textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

function MetaTile({ icon, label }: { icon: IconName; label: string }) {
  const theme = useTheme();

  return (
    <View style={styles.metaTile}>
      <Card style={styles.metaCard}>
        <Icon name={icon} size={32} />
        <Text
          style={[
            textVariants.bodyStrong,
            styles.metaLabel,
            { color: theme.colors.text },
          ]}
        >
          {label}
        </Text>
      </Card>
    </View>
  );
}

export default function LessonIntroScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { lesson, module, isLoading, error, retry } = useLesson(lessonId);
  const progress = useProgressStore((state) => state.lessons[lessonId]);
  const completed = progress?.status === 'completed';

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ContentColumn>
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
                backgroundColor: theme.colors.primarySoft,
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

          <View style={styles.copy}>
            <Text
              accessibilityRole="header"
              style={[theme.typography.title, { color: theme.colors.text }]}
            >
              {lesson.title}
            </Text>
            <Text
              style={[theme.typography.body, { color: theme.colors.textMuted }]}
            >
              {lesson.description}
            </Text>
          </View>

          <View style={styles.meta}>
            <MetaTile
              icon="book"
              label={`${lesson.exercises.length} questions`}
            />
            <MetaTile icon="practice" label={`${lesson.estimatedMinutes} min`} />
            {lesson.xpReward > 0 ? (
              <MetaTile icon="bolt" label={`${lesson.xpReward} XP`} />
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
            variant="contrast"
            fullWidth
          />
        </ScrollView>
      )}
      </ContentColumn>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    gap: 16,
    padding: 16,
  },
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingVertical: 24,
  },
  copy: {
    gap: 4,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaLabel: {
    textAlign: 'center',
  },
  metaTile: {
    flex: 1,
  },
  metaCard: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});
