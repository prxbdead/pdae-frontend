import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { screenContent } from '@/components/layout/screen';
import { EmptyState, OfflineBanner, PageHeader } from '@/components/ui';
import { useSyncStatus } from '@/offline/useSyncStatus';
import { useTheme } from '@/theme/useTheme';

import { PracticeCard } from './PracticeCard';
import { usePracticeData } from './usePracticeData';

export function PracticeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const sync = useSyncStatus();
  const { items, isLoading, error, refresh } = usePracticeData();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <PageHeader
        title="Practice"
        subtitle="Sharpen the weak spots"
        tier="standard"
      />

      {sync.state === 'offline' ? (
        <OfflineBanner state="offline" testID="practice-offline-banner" />
      ) : null}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : error ? (
        <EmptyState
          icon="practice"
          title="Couldn't load practice"
          message="The downloaded lessons could not be read from this device."
          actionLabel="Retry"
          onAction={refresh}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon="practice"
          title="Nothing to practice yet"
          message="Open a lesson first, then come back for drills."
        />
      ) : (
        <ScrollView contentContainerStyle={screenContent}>
          <Text
            style={[theme.typography.body, { color: theme.colors.textMuted }]}
          >
            Short drills built from the skills you have already met. No new
            material, no pressure.
          </Text>

          <View style={styles.grid}>
            {items.map((item) => (
              <View key={item.kind}>
                <PracticeCard
                  item={item}
                  onPress={() => {
                    if (!item.disabled) {
                      router.push(item.href);
                    }
                  }}
                />
              </View>
            ))}
          </View>

          <Text
            style={[
              theme.typography.caption,
              styles.disclaimer,
              { color: theme.colors.textMuted },
            ]}
          >
            Paper trading uses virtual money only. Nothing here is financial
            advice.
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
  grid: {
    gap: 12,
  },
  disclaimer: {
    textAlign: 'center',
  },
});
