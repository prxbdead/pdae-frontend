import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '@/assets/icons';
import { Card, Icon } from '@/components/ui';
import { textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export interface StatsGridProps {
  xp: number;
  streak: number;
  lessonsCompleted: number;
  accuracy: number | null;
}

function StatCard({
  icon,
  label,
  value,
  testID,
}: {
  icon: IconName;
  label: string;
  value: string;
  testID: string;
}) {
  const theme = useTheme();

  return (
    <View testID={testID} style={styles.cell}>
      <Card style={{ gap: theme.spacing.sm }}>
        <View style={[styles.row, { gap: theme.spacing.sm }]}>
          <Icon name={icon} size={36} />
          <View style={styles.text}>
            <Text
              numberOfLines={1}
              style={[textVariants.numeral, { color: theme.colors.text }]}
            >
              {value}
            </Text>
            <Text
              numberOfLines={1}
              style={[textVariants.label, { color: theme.colors.textMuted }]}
            >
              {label}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

export function StatsGrid({
  xp,
  streak,
  lessonsCompleted,
  accuracy,
}: StatsGridProps) {
  return (
    <View style={styles.grid}>
      <StatCard
        icon="bolt"
        label="Total XP"
        value={xp.toLocaleString()}
        testID="profile-stat-xp"
      />
      <StatCard
        icon="fire"
        label="Current streak"
        value={`${streak} ${streak === 1 ? 'day' : 'days'}`}
        testID="profile-stat-streak"
      />
      <StatCard
        icon="book"
        label="Lessons"
        value={String(lessonsCompleted)}
        testID="profile-stat-lessons"
      />
      <StatCard
        icon="chart"
        label="Accuracy"
        value={accuracy === null ? '—' : `${Math.round(accuracy * 100)}%`}
        testID="profile-stat-accuracy"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { flexBasis: '47%', flexGrow: 1, minWidth: 140 },
  row: { alignItems: 'center', flexDirection: 'row' },
  text: { flex: 1, minWidth: 0 },
});
