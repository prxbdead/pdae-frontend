import { useRouter } from 'expo-router';
import {
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { EmptyState, OfflineBanner, PageHeader } from '@/components/ui';
import { useSyncStatus } from '@/offline/useSyncStatus';
import { useTheme } from '@/theme/useTheme';

import { JumpToUnitSheet, scrollToUnit } from './JumpToUnitSheet';
import { LearnHeaderStats } from './LearnHeaderStats';
import { ChestTile, PathNode } from './PathNode';
import { PathCurve } from './PathCurve';
import { UnitBanner } from './UnitBanner';
import { useLearnPath } from './useLearnPath';

export function LearnScreen() {
  const theme = useTheme();
  const router = useRouter();
  const sync = useSyncStatus();
  const { units, isLoading, error, refresh } = useLearnPath();
  const [sheetOpen, setSheetOpen] = useState(false);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const unitSizes = useRef<Record<string, { banner: number; nodes: number }>>(
    {},
  );

  const currentLessonId =
    units
      .flatMap((unit) => unit.lessons)
      .find((lesson) => lesson.status === 'in_progress')?.id ??
    units
      .flatMap((unit) => unit.lessons)
      .find((lesson) => lesson.status === 'available')?.id ??
    null;

  const unitOffset = (targetId: string): number => {
    let y = 0;

    for (const unit of units) {
      if (unit.module.id === targetId) {
        break;
      }

      const size = unitSizes.current[unit.module.id];

      y += (size?.banner ?? 0) + (size?.nodes ?? 0);
    }

    return y;
  };

  const children: ReactNode[] = [];
  const stickyIndices: number[] = [];

  for (const unit of units) {
    const bannerIndex = children.length;

    stickyIndices.push(bannerIndex);
    children.push(
      <View
        key={`banner-${unit.module.id}`}
        onLayout={(event) => {
          unitSizes.current[unit.module.id] = {
            ...unitSizes.current[unit.module.id],
            banner: event.nativeEvent.layout.height,
            nodes: unitSizes.current[unit.module.id]?.nodes ?? 0,
          };
        }}
        style={{ backgroundColor: theme.colors.background }}
      >
        <UnitBanner
          module={unit.module}
          completed={unit.completed}
          total={unit.total}
          onJumpToUnit={() => setSheetOpen(true)}
        />
      </View>,
    );

    children.push(
      <View
        key={`nodes-${unit.module.id}`}
        onLayout={(event) => {
          unitSizes.current[unit.module.id] = {
            ...unitSizes.current[unit.module.id],
            banner: unitSizes.current[unit.module.id]?.banner ?? 0,
            nodes: event.nativeEvent.layout.height,
          };
        }}
      >
        <PathCurve count={unit.lessons.length} />

        {unit.lessons.map((lesson, index) => (
          <View key={lesson.id} style={styles.item}>
            <PathNode
              lesson={lesson}
              index={index}
              isCurrent={lesson.id === currentLessonId}
              onPress={() => router.push(`/lesson/${lesson.id}`)}
            />
            {(index + 1) % 4 === 0 ? (
              <ChestTile testID={`chest-${lesson.moduleId}-${index}`} />
            ) : null}
          </View>
        ))}
      </View>,
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <PageHeader
        title="Hodlo"
        tier="compact"
        right={<LearnHeaderStats />}
      />

      {sync.state === 'offline' ? (
        <OfflineBanner state="offline" testID="learn-offline-banner" />
      ) : null}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : error ? (
        <EmptyState
          icon="book"
          title="Couldn't load your path"
          message="The lessons are saved on this device, but the pack could not be read."
          actionLabel="Retry"
          onAction={refresh}
        />
      ) : units.length === 0 ? (
        <EmptyState
          icon="book"
          title="Your path starts here"
          message="No lessons are available yet."
        />
      ) : (
        <ScrollView
          ref={scrollRef}
          stickyHeaderIndices={stickyIndices}
          contentContainerStyle={styles.content}
        >
          {children}
        </ScrollView>
      )}

      <JumpToUnitSheet
        visible={sheetOpen}
        units={units}
        onClose={() => setSheetOpen(false)}
        onSelect={(sectionIndex) => {
          setSheetOpen(false);

          const unit = units[sectionIndex];

          if (unit) {
            scrollToUnit(scrollRef.current, unitOffset(unit.module.id));
          }
        }}
      />
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
    maxWidth: 720,
    paddingBottom: 48,
    width: '100%',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
