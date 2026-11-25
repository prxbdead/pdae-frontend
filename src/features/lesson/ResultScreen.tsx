import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { CharacterArtwork } from '@/components/mascot/CharacterArtwork';
import { CHARACTERS } from '@/components/mascot/types';
import {
  Artwork,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from '@/components/ui';
import { useSyncStatus } from '@/offline/useSyncStatus';
import { useProgressStore } from '@/stores/progressStore';
import { textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { DailyGoalRing } from './components/DailyGoalRing';
import { LevelUpModal } from './components/LevelUpModal';
import { ResultStat } from './components/ResultStat';
import { XpBurst } from './components/XpBurst';
import { useLesson } from './useLesson';

export interface ResultScreenProps {
  lessonId: string;
  attemptId?: string;
}

function formatDuration(startedAt: string, completedAt: string): string {
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return '—';
  }

  const seconds = Math.floor((end - start) / 1000);

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * Result view for one attempt. It only renders the locally stored result when
 * both the lesson and attempt id match the route, so a stale result from
 * another lesson can never appear here.
 */
export function ResultScreen({ lessonId, attemptId }: ResultScreenProps) {
  const router = useRouter();
  const theme = useTheme();
  const sync = useSyncStatus();
  const { module, lesson } = useLesson(lessonId);
  const lastResult = useProgressStore((state) => state.lastResult);
  const lastServerResult = useProgressStore(
    (state) => state.lastServerResult,
  );
  const streak = useProgressStore((state) => state.streak);
  const xpToday = useProgressStore((state) => state.xpToday);
  const dailyGoalXp = useProgressStore((state) => state.dailyGoalXp);
  const [levelUpDismissed, setLevelUpDismissed] = useState(false);

  const result =
    lastResult &&
    attemptId !== undefined &&
    lastResult.lessonId === lessonId &&
    lastResult.clientAttemptId === attemptId
      ? lastResult
      : null;

  const applied =
    result &&
    lastServerResult?.clientAttemptId === result.clientAttemptId
      ? lastServerResult
      : null;

  if (!result) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <ContentColumn>
          <PageHeader title="Lesson result" tier="compact" />
          <EmptyState
            icon="book"
            title="Result unavailable"
            message="This attempt is not on this device. Your progress is still saved."
            actionLabel="Back to Learn"
            onAction={() => router.dismissTo('/(tabs)/learn')}
          />
        </ContentColumn>
      </View>
    );
  }

  const score = applied?.score ?? result.score;
  const passed = applied?.passed ?? result.passed;
  const xp = applied?.xpEarned ?? result.xpEarned;
  const showXp = (lesson?.xpReward ?? 1) > 0;
  const teacher = module?.teacherCharacterId ?? 'hodlo';
  const achievements = applied?.newAchievements ?? [];
  const levelUp = applied?.levelUp ?? null;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ContentColumn>
        <PageHeader
          title={passed ? 'Lesson complete' : 'Keep practicing'}
          tier="compact"
        />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <View
              accessible
              accessibilityLabel={`${CHARACTERS[teacher].name}, ${passed ? 'celebrate' : 'sad'}`}
            >
              <CharacterArtwork character={teacher} size={144} />
            </View>
            <Text
              accessibilityRole="header"
              style={[theme.typography.title, { color: theme.colors.text }]}
            >
              {passed ? 'Nice work!' : 'Good effort.'}
            </Text>
          </View>

          {showXp ? <XpBurst value={xp} testID="result-xp" /> : null}

          <View style={styles.stats}>
            <ResultStat
              label="Accuracy"
              tone="mint"
              value={`${Math.round(score * 100)}%`}
              testID="result-accuracy"
            />
            <ResultStat
              label="Time"
              tone="lilac"
              value={formatDuration(result.startedAt, result.completedAt)}
              testID="result-time"
            />
            <ResultStat
              label="Streak"
              tone="coral"
              icon="fire"
              value={`${streak.current} day${streak.current === 1 ? '' : 's'}`}
              testID="result-streak"
            />
          </View>

          <DailyGoalRing xpToday={xpToday} goal={dailyGoalXp} />

          {applied ? (
            <View style={styles.syncRow}>
              <Artwork name="correct" size={20} />
              <Text
                testID="result-synced"
                accessibilityLiveRegion="polite"
                style={[textVariants.label, { color: theme.colors.text }]}
              >
                Synced
              </Text>
            </View>
          ) : (
            <Card tone="accent">
              <Text
                testID="result-pending"
                accessibilityLiveRegion="polite"
                style={[textVariants.label, { color: theme.colors.text }]}
              >
                {sync.state === 'syncing'
                  ? 'Syncing your result…'
                  : "Saved offline — XP and streak will sync when you're back online."}
              </Text>
            </Card>
          )}

          {achievements.length > 0 ? (
            <View style={styles.achievements}>
              <Text
                style={[theme.typography.heading, { color: theme.colors.text }]}
              >
                New achievements
              </Text>
              <View style={styles.badges}>
                {achievements.map((achievement) => (
                  <Badge
                    key={achievement.id}
                    label={achievement.title}
                    tone="yellow"
                    testID={`achievement-${achievement.id}`}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button
              label="Continue"
              onPress={() => router.dismissTo('/(tabs)/learn')}
              size="lg"
              fullWidth
              testID="result-continue"
            />
            <Button
              label="Practice mistakes"
              onPress={() => router.push('/practice/mistakes')}
              variant="contrast"
              fullWidth
              testID="result-practice"
            />
            <Button
              label="Retry lesson"
              onPress={() => router.replace(`/lesson/${lessonId}`)}
              variant="ghost"
              fullWidth
              testID="result-retry"
            />
          </View>
        </ScrollView>
      </ContentColumn>

      <LevelUpModal
        levelUp={levelUp}
        visible={levelUp !== null && !levelUpDismissed}
        onClose={() => setLevelUpDismissed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  syncRow: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  achievements: {
    gap: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actions: {
    gap: 12,
  },
});
