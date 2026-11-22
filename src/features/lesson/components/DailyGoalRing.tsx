import { StyleSheet, Text, View } from 'react-native';

import { ProgressRing } from '@/components/ui';
import { dailyProgress } from '@/features/gamification/dailyGoal';
import { useTheme } from '@/theme/useTheme';

export interface DailyGoalRingProps {
  xpToday: number;
  goal: number;
}

export function DailyGoalRing({ xpToday, goal }: DailyGoalRingProps) {
  const theme = useTheme();
  const progress = dailyProgress(xpToday, goal);

  return (
    <View
      accessible
      accessibilityLabel={`Daily goal ${progress.current} of ${progress.goal} XP`}
      style={styles.row}
    >
      <ProgressRing
        value={progress.percent / 100}
        tone={progress.reached ? 'mint' : 'purple'}
        label={`${progress.current}/${progress.goal}`}
      />
      <View style={styles.copy}>
        <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
          Daily goal
        </Text>
        <Text
          style={[theme.typography.caption, { color: theme.colors.textMuted }]}
        >
          {progress.current} / {progress.goal} XP
          {progress.reached ? ' · Reached' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  copy: {
    flexShrink: 1,
    gap: 2,
  },
});
