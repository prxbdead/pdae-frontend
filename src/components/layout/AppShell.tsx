import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useBreakpoint } from '@/theme/useBreakpoint';

import { BottomTabs } from './BottomTabs';
import { ContentColumn } from './ContentColumn';
import { IconRail } from './IconRail';
import { RightRail } from './RightRail';
import { Sidebar } from './Sidebar';

export interface AppShellProps {
  children: ReactNode;
}

/**
 * One navigation frame for every viewport: bottom tabs on mobile, an icon
 * rail on tablet, and sidebar + content column + right rail on desktop.
 */
export function AppShell({ children }: AppShellProps) {
  const { isMobile, isTablet } = useBreakpoint();

  if (isMobile) {
    return (
      <View style={styles.root}>
        <View style={styles.fill}>{children}</View>
        <BottomTabs />
      </View>
    );
  }

  if (isTablet) {
    return (
      <View style={[styles.root, styles.row]}>
        <IconRail />
        <View style={styles.fill}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.root, styles.row]}>
      <Sidebar />
      <ContentColumn>{children}</ContentColumn>
      <RightRail />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  fill: {
    flex: 1,
  },
});
