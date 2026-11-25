import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSafeInsets } from '@/theme/useSafeInsets';
import { useTheme } from '@/theme/useTheme';

import { Icon } from './Icon';

export interface PageHeaderProps {
  title: string;
  /** One quiet line under the title. Ignored by the compact tier. */
  subtitle?: string;
  tier?: 'compact' | 'standard' | 'hero';
  onBack?(): void;
  right?: ReactNode;
  artwork?: ReactNode;
  testID?: string;
}

const TIER_HEIGHT = { compact: 56, standard: 88, hero: 160 } as const;
const TITLE_OFFSET = 16;
const RIGHT_RESERVE = 176;

export function PageHeader({
  title,
  subtitle,
  tier = 'standard',
  onBack,
  right,
  artwork,
  testID,
}: PageHeaderProps) {
  const theme = useTheme();
  const compact = tier === 'compact';
  const { top } = useSafeInsets();

  return (
    <View
      testID={testID ?? 'page-header'}
      style={[
        styles.header,
        {
          height: TIER_HEIGHT[tier] + top,
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      {artwork ? <View style={StyleSheet.absoluteFill}>{artwork}</View> : null}
      <View
        testID="page-header-title"
        style={[
          styles.titleContainer,
          { right: right ? RIGHT_RESERVE : TITLE_OFFSET },
        ]}
      >
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            style={styles.backButton}
          >
            <Icon name="arrow-left" color={theme.colors.text} size={22} />
          </Pressable>
        ) : null}
        <View style={styles.titleGroup}>
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            style={[
              theme.typography.title,
              styles.title,
              { color: theme.colors.text },
            ]}
          >
            {title}
          </Text>
          {subtitle && !compact ? (
            <Text
              numberOfLines={1}
              style={[theme.typography.caption, { color: theme.colors.textMuted }]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    borderBottomWidth: 2,
    justifyContent: 'flex-end',
  },
  titleContainer: {
    position: 'absolute',
    left: TITLE_OFFSET,
    bottom: TITLE_OFFSET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: { flexShrink: 1 },
  title: { flexShrink: 1 },
  right: {
    position: 'absolute',
    right: TITLE_OFFSET,
    bottom: TITLE_OFFSET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
