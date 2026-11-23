import { StyleSheet, Text, View } from 'react-native';

import type { LeaderboardEntry } from '@/api/contracts';
import { Badge } from '@/components/ui';
import {
  avatarColor,
  avatarInitials,
  avatarTextColor,
} from '@/features/profile/avatar';
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
            ? theme.colors.secondary
            : theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          theme.typography.caption,
          styles.rank,
          {
            color: isCurrent ? theme.colors.onSecondary : theme.colors.textMuted,
          },
        ]}
      >
        {entry.rank}
      </Text>

      <View
        style={[
          styles.avatar,
          {
            backgroundColor: avatarColor(entry.userId),
            borderRadius: theme.radii.pill,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.caption,
            styles.initials,
            { color: avatarTextColor(entry.userId) },
          ]}
        >
          {avatarInitials(entry.displayName)}
        </Text>
      </View>

      <View style={styles.name}>
        <Text
          numberOfLines={1}
          style={[
            theme.typography.body,
            styles.strong,
            { color: theme.colors.text },
          ]}
        >
          {entry.displayName}
        </Text>
        {isCurrent ? (
          <View testID="leaderboard-you">
            <Badge label="You" tone="purple" />
          </View>
        ) : null}
      </View>

      <Text
        style={[
          theme.typography.caption,
          styles.strong,
          { color: theme.colors.text },
        ]}
      >
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
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rank: {
    fontWeight: '800',
    textAlign: 'center',
    width: 26,
  },
  avatar: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  initials: {
    fontWeight: '900',
  },
  name: {
    flex: 1,
    gap: 2,
  },
  strong: {
    fontWeight: '800',
  },
});
