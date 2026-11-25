import { StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/auth/useSession';
import { Artwork, type ArtworkName } from '@/components/ui/Artwork';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProgressStore } from '@/stores/progressStore';
import { textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

function RailCardHeader({
  artwork,
  title,
  tone,
}: {
  artwork: ArtworkName;
  title: string;
  tone: 'purple' | 'mint' | 'yellow';
}) {
  const theme = useTheme();
  const background =
    tone === 'mint'
      ? theme.colors.successSoft
      : tone === 'yellow'
        ? theme.colors.warningSoft
        : theme.colors.primarySoft;

  return (
    <View style={styles.cardHead}>
      <View
        style={[
          styles.iconTile,
          { backgroundColor: background, borderRadius: theme.radii.sm },
        ]}
      >
        <Artwork name={artwork} size={22} />
      </View>
      <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
        {title}
      </Text>
    </View>
  );
}

/**
 * Desktop-only companion rail. It is intentionally informational: the app's
 * navigation stays in the sidebar while daily progress, streak, league, and a
 * safety tip remain visible beside the focused lesson column.
 */
export function RightRail() {
  const theme = useTheme();
  const { user } = useSession();
  const xpToday = useProgressStore((state) => state.xpToday);
  const dailyGoalXp = useProgressStore((state) => state.dailyGoalXp);
  const localStreak = useProgressStore((state) => state.streak.current);
  const streak = Math.max(localStreak, user?.streak.current ?? 0);
  const remaining = Math.max(0, dailyGoalXp - xpToday);

  return (
    <View
      testID="right-rail"
      style={[
        styles.rail,
        {
          backgroundColor: theme.colors.background,
          borderLeftColor: theme.colors.border,
          gap: theme.spacing.sm,
          padding: theme.spacing.md,
        },
      ]}
    >
      <View style={[styles.heading, { paddingHorizontal: theme.spacing.xxs }]}>
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>
          Your progress
        </Text>
        <Text
          style={[theme.typography.caption, { color: theme.colors.textMuted }]}
        >
          A little each day adds up.
        </Text>
      </View>

      <Card testID="right-rail-daily-goal">
        <RailCardHeader artwork="bolt" title="Daily goal" tone="yellow" />
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>
          {xpToday} / {dailyGoalXp} XP
        </Text>
        <View style={{ marginTop: theme.spacing.xs }}>
          <ProgressBar value={xpToday} max={dailyGoalXp} tone="yellow" />
        </View>
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted, marginTop: theme.spacing.xs },
          ]}
        >
          {remaining === 0
            ? 'Daily goal reached — great work!'
            : `${remaining} XP to reach your goal`}
        </Text>
      </Card>

      <Card testID="right-rail-streak">
        <RailCardHeader artwork="fire" title="Streak" tone="mint" />
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>
          {streak} {streak === 1 ? 'day' : 'days'}
        </Text>
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted, marginTop: theme.spacing.xs },
          ]}
        >
          One lesson keeps the habit alive.
        </Text>
      </Card>

      <Card testID="right-rail-league">
        <RailCardHeader artwork="leagues" title="Weekly league" tone="purple" />
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted, marginTop: theme.spacing.xs },
          ]}
        >
          Open Leagues to see this week&apos;s bracket and your position.
        </Text>
      </Card>

      <Card testID="right-rail-tip">
        <RailCardHeader artwork="shield" title="Safety tip" tone="purple" />
        <Text
          style={[
            textVariants.label,
            { color: theme.colors.text, marginTop: theme.spacing.xs },
          ]}
        >
          Never share a seed phrase. No support agent needs it.
        </Text>
      </Card>

      <Text
        style={[
          theme.typography.caption,
          styles.legal,
          { color: theme.colors.textMuted },
        ]}
      >
        Educational only. Not financial advice.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    borderLeftWidth: 2,
    width: 300,
  },
  heading: {
    gap: 2,
    paddingBottom: 4,
  },
  cardHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  iconTile: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  legal: {
    paddingHorizontal: 4,
    textAlign: 'center',
  },
});
