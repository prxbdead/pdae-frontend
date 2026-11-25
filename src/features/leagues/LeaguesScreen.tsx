import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { LeaderboardEntry } from '@/api/contracts';
import { screenContent } from '@/components/layout/screen';
import {
  Avatar,
  Card,
  EmptyState,
  OfflineBanner,
  PageHeader,
} from '@/components/ui';
import { useSyncStatus } from '@/offline/useSyncStatus';
import { ledgeColors, textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Countdown } from './Countdown';
import { LeaderboardRow } from './LeaderboardRow';
import { TierBadge, TIER_LABELS, TIER_COLORS } from './TierBadge';
import { useLeaderboard } from './useLeaderboard';

const PODIUM_ORDER = [2, 1, 3] as const;
const PODIUM_HEIGHT = { 1: 176, 2: 152, 3: 144 } as const;

function PodiumCard({
  entry,
  place,
}: {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
}) {
  const theme = useTheme();
  const medal =
    place === 1
      ? TIER_COLORS.gold
      : place === 2
        ? TIER_COLORS.silver
        : TIER_COLORS.bronze;

  return (
    <View testID={`leaderboard-podium-${place}`} style={styles.podiumCell}>
      <Card
        padded={false}
        style={{
          ...styles.podiumCard,
          borderTopColor: medal,
          borderTopWidth: 6,
          minHeight: PODIUM_HEIGHT[place],
          padding: theme.spacing.sm,
        }}
      >
        <View
          style={[
            styles.medal,
            { backgroundColor: medal, borderRadius: theme.radii.pill },
          ]}
        >
          <Text style={[textVariants.label, { color: theme.colors.onWarning }]}>
            {place}
          </Text>
        </View>
        <Avatar id={entry.userId} name={entry.displayName} size={48} />
        <Text
          numberOfLines={1}
          style={[textVariants.bodyStrong, { color: theme.colors.text }]}
        >
          {entry.displayName}
        </Text>
        <Text style={[textVariants.label, { color: theme.colors.textMuted }]}>
          {entry.xp} XP
        </Text>
      </Card>
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
  const line = tone === 'mint' ? ledgeColors.mint : ledgeColors.coral;
  const background =
    tone === 'mint' ? theme.colors.successSoft : theme.colors.dangerSoft;

  return (
    <View testID={testID} style={styles.zone}>
      <View style={[styles.zoneLine, { backgroundColor: line }]} />
      <View
        style={[
          styles.zonePill,
          { backgroundColor: background, borderRadius: theme.radii.pill },
        ]}
      >
        <Text style={[textVariants.overline, { color: theme.colors.text }]}>
          {label}
        </Text>
      </View>
      <View style={[styles.zoneLine, { backgroundColor: line }]} />
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
      <PageHeader title="Leagues" subtitle="Weekly standings" tier="standard" />

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
        <ScrollView contentContainerStyle={screenContent}>
          <Card>
            <View style={[styles.hero, { gap: theme.spacing.md }]}>
              <TierBadge tier={data.tier} size={72} />
              <View style={styles.heroText}>
                <Text
                  style={[
                    textVariants.overline,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  Weekly league
                </Text>
                <Text
                  style={[theme.typography.heading, { color: theme.colors.text }]}
                >
                  {TIER_LABELS[data.tier]} league
                </Text>
                <View
                  style={[
                    styles.countdown,
                    {
                      backgroundColor: theme.colors.primarySoft,
                      borderRadius: theme.radii.pill,
                    },
                  ]}
                >
                  <Countdown endsAt={data.endsAt} />
                </View>
              </View>
            </View>
          </Card>

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
            {PODIUM_ORDER.map((place) => {
              const entry = podium.find((candidate) => candidate.rank === place);

              return entry ? (
                <PodiumCard key={entry.userId} entry={entry} place={place} />
              ) : null;
            })}
          </View>

          <Card padded={false}>
            {rows.map((entry) => {
              const beforeDemotion = entry.rank === demotionStart;

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
          </Card>

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
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  countdown: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  podium: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
  },
  podiumCell: {
    flex: 1,
  },
  podiumCard: {
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  medal: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  zone: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  zoneLine: {
    flex: 1,
    height: 2,
  },
  zonePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  footer: {
    textAlign: 'center',
  },
});
