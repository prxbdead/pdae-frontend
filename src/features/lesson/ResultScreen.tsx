import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge, Button, EmptyState, PageHeader } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import { useSyncStatus } from '@/offline/useSyncStatus';
import { useProgressStore } from '@/stores/progressStore';
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
    lastResult.lessonId === lessonId &&
    (!attemptId || lastResult.clientAttemptId === attemptId)
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
        <PageHeader title="Lesson result" tier="compact" />
        <EmptyState
          icon="book"
          title="Result unavailable"
          message="This attempt is not on this device. Your progress is still saved."
          actionLabel="Back to Learn"
          onAction={() => router.dismissTo('/(tabs)/learn')}
        />
      </View>
    );
  }

  const score = applied?.score ?? result.score;
  const passed = applied?.passed ?? result.passed;
  const xp = applied?.xpEarned ?? result.xpEarned;
  const showXp = (lesson?.xpReward ?? 1) > 0;
  const achievements = applied?.newAchievements ?? [];
  const levelUp = applied?.levelUp ?? null;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <PageHeader
        title={passed ? 'Lesson complete' : 'Keep practicing'}
        tier="compact"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Mascot
            character={module?.teacherCharacterId ?? 'hodlo'}
            mood={passed ? 'celebrate' : 'sad'}
            size="md"
          />
        </View>

        <Text style={[theme.typography.title, { color: theme.colors.text }]}>
          {passed ? 'Nice work!' : 'Good effort.'}
        </Text>

        {showXp ? <XpBurst value={xp} testID="result-xp" /> : null}

        <View style={styles.stats}>
          <ResultStat
            label="Accuracy"
            value={`${Math.round(score * 100)}%`}
            testID="result-accuracy"
          />
          <ResultStat
            label="Time"
            value={formatDuration(result.startedAt, result.completedAt)}
            testID="result-time"
          />
          <ResultStat
            label="Streak"
            value={`${streak.current} day${streak.current === 1 ? '' : 's'}`}
            testID="result-streak"
          />
        </View>

        <DailyGoalRing xpToday={xpToday} goal={dailyGoalXp} />

        {applied ? (
          <Text
            testID="result-synced"
            accessibilityLiveRegion="polite"
            style={[theme.typography.caption, { color: theme.colors.success }]}
          >
            Synced
          </Text>
        ) : (
          <Text
            testID="result-pending"
            accessibilityLiveRegion="polite"
            style={[theme.typography.caption, { color: theme.colors.textMuted }]}
          >
            {sync.state === 'syncing'
              ? 'Syncing your result…'
              : "Saved offline — XP and streak will sync when you're back online."}
          </Text>
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
            variant="secondary"
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
    alignSelf: 'center',
    gap: 20,
    maxWidth: 600,
    padding: 24,
    paddingBottom: 48,
    width: '100%',
  },
  hero: {
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
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
