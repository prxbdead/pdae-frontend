import { StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/auth/useSession';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProgressStore } from '@/stores/progressStore';
import { useTheme } from '@/theme/useTheme';

const INFO_CARDS = [
  { key: 'league', title: 'League', body: 'Unranked this week' },
  { key: 'tip', title: 'Safety tip', body: 'Never share a seed phrase. No support agent needs it.' },
];

export function RightRail() {
  const theme = useTheme();
  const { user } = useSession();
  const xpToday = useProgressStore(state => state.xpToday);
  const dailyGoalXp = useProgressStore(state => state.dailyGoalXp);
  const localStreak = useProgressStore(state => state.streak.current);
  const streak = Math.max(localStreak, user?.streak.current ?? 0);

  return (
    <View testID="right-rail" style={[styles.rail, { borderLeftColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
      <View style={styles.heading}>
        <Text style={[theme.typography.heading, { color: theme.colors.text }]}>Your progress</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>A little each day adds up.</Text>
      </View>

      <Card testID="right-rail-daily-goal">
        <View style={styles.cardHead}>
          <View style={[styles.iconTile, { backgroundColor: '#FFF4C2' }]}>
            <Icon name="bolt" color="#A77B00" size={19} />
          </View>
          <Text style={[theme.typography.heading, { color: theme.colors.text }]}>Daily goal</Text>
        </View>
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>{xpToday} / {dailyGoalXp} XP</Text>
        <ProgressBar value={xpToday} max={dailyGoalXp} height={10} tone="yellow" />
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
          {xpToday >= dailyGoalXp ? 'Daily goal reached — great work!' : `${Math.max(0, dailyGoalXp - xpToday)} XP to reach your goal`}
        </Text>
      </Card>

      <Card testID="right-rail-streak">
        <View style={styles.cardHead}>
          <View style={[styles.iconTile, { backgroundColor: '#FFE5E9' }]}>
            <Icon name="fire" color={theme.colors.fox} size={19} />
          </View>
          <Text style={[theme.typography.heading, { color: theme.colors.text }]}>Streak</Text>
        </View>
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>{streak} {streak === 1 ? 'day' : 'days'}</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>One lesson keeps the habit alive.</Text>
      </Card>

      {INFO_CARDS.map((item, index) => (
        <Card key={item.key} testID={`right-rail-${item.key}`}>
          <View style={styles.cardHead}>
            <View style={[styles.iconTile, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Icon name={index === 0 ? 'leagues' : 'shield'} color={theme.colors.primary} size={19} />
            </View>
            <Text style={[theme.typography.heading, { color: theme.colors.text }]}>{item.title}</Text>
          </View>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{item.body}</Text>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { width: 288, padding: 18, gap: 14, borderLeftWidth: 1 },
  heading: { gap: 3, paddingHorizontal: 4, paddingBottom: 2 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconTile: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
});
