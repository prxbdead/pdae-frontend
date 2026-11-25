import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import type { IconName } from '@/assets/icons';
import { ledgeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export interface StatsGridProps { xp: number; streak: number; lessonsCompleted: number; accuracy: number | null; }

const TONES: Record<string, { fill: string; ledge: string; icon: string }> = {
  xp: { fill: '#FFF4C2', ledge: ledgeColors.yellow, icon: '#A77B00' },
  streak: { fill: '#FFE5E9', ledge: ledgeColors.coral, icon: '#C93B4D' },
  lessons: { fill: '#E5FFF0', ledge: ledgeColors.mint, icon: '#18864B' },
  accuracy: { fill: '#EEE9FF', ledge: ledgeColors.lilac, icon: '#6C4CF1' },
};

function StatCard({ icon, label, value, testID, tone }: { icon: IconName; label: string; value: string; testID: string; tone: keyof typeof TONES }) {
  const theme = useTheme();
  const colors = TONES[tone];
  return (
    <View style={[styles.ledge, { backgroundColor: colors.ledge, borderRadius: theme.radii.md }]}>
      <View testID={testID} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.md }]}>
        <View style={styles.labelRow}>
          <View style={[styles.iconTile, { backgroundColor: colors.fill, borderRadius: 10 }]}><Icon name={icon} color={colors.icon} size={18} /></View>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{label}</Text>
        </View>
        <Text style={[theme.typography.heading, { color: theme.colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

export function StatsGrid({ xp, streak, lessonsCompleted, accuracy }: StatsGridProps) {
  return (
    <View style={styles.grid}>
      <StatCard icon="bolt" label="Total XP" value={xp.toLocaleString()} tone="xp" testID="profile-stat-xp" />
      <StatCard icon="fire" label="Current streak" value={`${streak} ${streak === 1 ? 'day' : 'days'}`} tone="streak" testID="profile-stat-streak" />
      <StatCard icon="book" label="Lessons" value={String(lessonsCompleted)} tone="lessons" testID="profile-stat-lessons" />
      <StatCard icon="chart" label="Accuracy" value={accuracy === null ? '—' : `${Math.round(accuracy * 100)}%`} tone="accuracy" testID="profile-stat-accuracy" />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ledge: { flexBasis: '47%', flexGrow: 1, minWidth: 140, paddingBottom: 4 },
  card: { borderWidth: 1, gap: 8, padding: 13 },
  labelRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  iconTile: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
});
