import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui';
import type { IconName } from '@/assets/icons';
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
    <View
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
        },
      ]}
    >
      <View style={styles.labelRow}>
        <Icon name={icon} color={theme.colors.primary} size={18} />
        <Text
          style={[theme.typography.caption, { color: theme.colors.textMuted }]}
        >
          {label}
        </Text>
      </View>
      <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
        {value}
      </Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: 4,
    minWidth: 140,
    padding: 14,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
});
