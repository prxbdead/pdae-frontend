import { StyleSheet, Text, View } from 'react-native';

import type { LeaderboardEntry } from '@/api/contracts';
import { Avatar, Badge } from '@/components/ui';
import { textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  currentUserId: string;
}

export function LeaderboardRow({ entry, currentUserId }: LeaderboardRowProps) {
  const theme = useTheme();
  const isCurrent = entry.userId === currentUserId;

  return (
    <View
      accessible
      accessibilityLabel={`Rank ${entry.rank}, ${entry.displayName}, ${entry.xp} XP${isCurrent ? ', you' : ''}`}
      testID={`leaderboard-entry-${entry.userId}`}
      style={[
        styles.row,
        {
          backgroundColor: isCurrent
            ? theme.colors.primarySoft
            : theme.colors.surface,
          borderBottomColor: theme.colors.border,
          gap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
        },
      ]}
    >
      <Text
        style={[
          textVariants.bodyStrong,
          styles.rank,
          { color: theme.colors.textMuted },
        ]}
      >
        {entry.rank}
      </Text>

      <Avatar id={entry.userId} name={entry.displayName} size={40} />

      <View style={styles.name}>
        <Text
          numberOfLines={1}
          style={[textVariants.bodyStrong, { color: theme.colors.text }]}
        >
          {entry.displayName}
        </Text>
        {isCurrent ? (
          <View testID="leaderboard-you">
            <Badge label="You" tone="purple" />
          </View>
        ) : null}
      </View>

      <Text style={[textVariants.label, { color: theme.colors.textMuted }]}>
        {entry.xp.toLocaleString()} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 60,
  },
  rank: {
    textAlign: 'center',
    width: 24,
  },
  name: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
});
