import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';
import { palette } from '@/theme/tokens';

import { Icon } from './Icon';

export interface PageHeaderProps {
  title: string;
  tier?: 'compact' | 'standard' | 'hero';
  onBack?(): void;
  right?: ReactNode;
  artwork?: ReactNode;
  testID?: string;
}

const TIER_HEIGHT = { compact: 64, standard: 96, hero: 168 } as const;
const TITLE_OFFSET = 16;

export function PageHeader({ title, tier = 'standard', onBack, right, artwork, testID }: PageHeaderProps) {
  const theme = useTheme();
  return (
    <View testID={testID ?? 'page-header'} style={[styles.header, { height: TIER_HEIGHT[tier], backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      {artwork ? <View style={StyleSheet.absoluteFill}>{artwork}</View> : null}
      <View testID="page-header-title" style={styles.titleContainer}>
        {onBack ? <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.backButton}><Icon name="arrow-left" color={theme.colors.text} size={22} /></Pressable> : null}
        <View style={styles.titleGroup}>
          {tier !== 'compact' ? <Text style={[theme.typography.caption, styles.eyebrow, { color: theme.colors.primary }]}>{title === 'Hodlo' ? 'YOUR LEARNING JOURNEY' : 'HODLO LEARNING SPACE'}</Text> : null}
          <Text numberOfLines={1} style={[theme.typography.title, styles.title, { color: theme.colors.text }]}>{title}</Text>
        </View>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
      {tier === 'compact' ? <View pointerEvents="none" style={styles.brandMark}><Text style={styles.brandLetter}>H</Text></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { width: '100%', borderBottomWidth: 1, justifyContent: 'flex-end' },
  titleContainer: { position: 'absolute', left: TITLE_OFFSET, right: TITLE_OFFSET, bottom: TITLE_OFFSET, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titleGroup: { flexShrink: 1, gap: 0 },
  title: { flexShrink: 1 },
  eyebrow: { fontWeight: '900', letterSpacing: 1.1 },
  right: { position: 'absolute', right: TITLE_OFFSET, bottom: TITLE_OFFSET, flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandMark: { position: 'absolute', left: 16, top: 7, width: 30, height: 30, borderRadius: 10, backgroundColor: palette.purple, alignItems: 'center', justifyContent: 'center' },
  brandLetter: { color: '#FFFFFF', fontWeight: '900', fontSize: 18 },
});
