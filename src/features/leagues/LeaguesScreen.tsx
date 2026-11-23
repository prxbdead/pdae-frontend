import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { LeaderboardEntry } from '@/api/contracts';
import {
  EmptyState,
  OfflineBanner,
  PageHeader,
} from '@/components/ui';
import { useSyncStatus } from '@/offline/useSyncStatus';
import {
  avatarColor,
  avatarInitials,
  avatarTextColor,
} from '@/features/profile/avatar';
import { palette } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Countdown } from './Countdown';
import { LeaderboardRow } from './LeaderboardRow';
import { TierBadge, TIER_LABELS, TIER_COLORS } from './TierBadge';
import { useLeaderboard } from './useLeaderboard';

function PodiumCard({
  entry,
  place,
}: {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
}) {
  const theme = useTheme();
  const minHeight = place === 1 ? 152 : place === 2 ? 136 : 128;
  const medal =
    place === 1
      ? TIER_COLORS.gold
      : place === 2
        ? TIER_COLORS.silver
        : TIER_COLORS.bronze;

  return (
    <View
      testID={`leaderboard-podium-${place}`}
      style={[
        styles.podiumCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: medal,
          borderTopLeftRadius: theme.radii.md,
          borderTopRightRadius: theme.radii.md,
          minHeight,
        },
      ]}
    >
      <Text style={[theme.typography.caption, styles.medal, { color: medal }]}>
        {place}
      </Text>
      <View
        style={[
          styles.podiumAvatar,
          {
            backgroundColor: avatarColor(entry.userId),
            borderRadius: theme.radii.pill,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.caption,
            styles.podiumInitials,
            { color: avatarTextColor(entry.userId) },
          ]}
        >
          {avatarInitials(entry.displayName)}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        style={[theme.typography.caption, styles.strong, { color: theme.colors.text }]}
      >
        {entry.displayName}
      </Text>
      <Text
        style={[theme.typography.caption, { color: theme.colors.textMuted }]}
      >
        {entry.xp} XP
      </Text>
    </View>
  );
}

function ZoneLabel({
  label,
  tone,
  testID,
}: {
  label: string;
  tone: 'mint' | 'coral';
  testID: string;
}) {
  const theme = useTheme();
  const color =
    tone === 'mint' ? theme.colors.success : theme.colors.danger;

  return (
    <View testID={testID} style={styles.zone}>
      <View style={[styles.zoneLine, { backgroundColor: color }]} />
      <Text
        style={[theme.typography.caption, styles.zoneText, { color }]}
      >
        {label}
      </Text>
      <View style={[styles.zoneLine, { backgroundColor: color }]} />
    </View>
  );
}

export function LeaguesScreen() {
  const theme = useTheme();
  const sync = useSyncStatus();
  const { data, isLoading, error, isStale, refresh } = useLeaderboard();
  const offline = sync.state === 'offline';

  const podium = data
    ? data.entries.filter((entry) => entry.rank <= 3).sort((a, b) => a.rank - b.rank)
    : [];
  const rows = data ? data.entries.filter((entry) => entry.rank > 3) : [];
  const demotionStart = data
    ? data.entries.length - data.demotionZone + 1
    : Number.POSITIVE_INFINITY;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <PageHeader title="Leagues" tier="standard" />

      {offline ? (
        <OfflineBanner state="offline" testID="leaderboard-offline-banner" />
      ) : null}

      {isLoading && !data ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : !data ? (
        <EmptyState
          icon="leagues"
          title="Couldn't load your league"
          message="Standings will appear when you are back online."
          actionLabel="Retry"
          onAction={refresh}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radii.lg,
              },
            ]}
          >
            <TierBadge tier={data.tier} size={58} />
            <View style={styles.heroText}>
              <Text
                style={[
                  theme.typography.caption,
                  styles.kicker,
                  { color: theme.colors.onPrimary },
                ]}
              >
                WEEKLY LEAGUE
              </Text>
              <Text
                style={[
                  theme.typography.heading,
                  { color: theme.colors.onPrimary },
                ]}
              >
                {TIER_LABELS[data.tier]} league
              </Text>
            </View>
            <View style={styles.countdown}>
              <Countdown endsAt={data.endsAt} color={palette.plum} />
            </View>
          </View>

          {isStale ? (
            <Text
              testID="leaderboard-cached"
              style={[
                theme.typography.caption,
                { color: theme.colors.textMuted },
              ]}
            >
              {error
                ? 'Showing last synced standings.'
                : 'Showing last synced standings from this device.'}
            </Text>
          ) : null}

          <View style={styles.podium}>
            {podium.map((entry) => (
              <PodiumCard
                key={entry.userId}
                entry={entry}
                place={entry.rank as 1 | 2 | 3}
              />
            ))}
          </View>

          <View
            style={[
              styles.list,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.lg,
              },
            ]}
          >
            {rows.map((entry) => {
              const beforeDemotion =
                entry.rank === demotionStart;

              return (
                <View key={entry.userId}>
                  {beforeDemotion ? (
                    <ZoneLabel
                      testID="leaderboard-demotion"
                      label={`Demotion zone · bottom ${data.demotionZone}`}
                      tone="coral"
                    />
                  ) : null}
                  <LeaderboardRow
                    entry={entry}
                    currentUserId={data.currentUserId}
                  />
                  {entry.rank === data.promotionZone ? (
                    <ZoneLabel
                      testID="leaderboard-promotion"
                      label={`Promotion zone · top ${data.promotionZone}`}
                      tone="mint"
                    />
                  ) : null}
                </View>
              );
            })}
          </View>

          <Text
            style={[
              theme.typography.caption,
              styles.footer,
              { color: theme.colors.textMuted },
            ]}
          >
            Earn XP from lessons and practice to climb. The top{' '}
            {data.promotionZone} move up when the week ends.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignSelf: 'center',
    gap: 16,
    maxWidth: 720,
    padding: 20,
    paddingBottom: 48,
    width: '100%',
  },
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.8,
  },
  countdown: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  podium: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  podiumCard: {
    alignItems: 'center',
    borderTopWidth: 4,
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    maxWidth: 180,
    padding: 10,
  },
  medal: {
    fontWeight: '900',
  },
  podiumAvatar: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  podiumInitials: {
    fontWeight: '900',
  },
  strong: {
    fontWeight: '800',
  },
  list: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  zone: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  zoneLine: {
    flex: 1,
    height: 1,
  },
  zoneText: {
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  footer: {
    textAlign: 'center',
  },
});
