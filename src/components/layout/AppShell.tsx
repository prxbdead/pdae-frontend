import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useBreakpoint } from '@/theme/useBreakpoint';
import { useTheme } from '@/theme/useTheme';

import { BottomTabs } from './BottomTabs';
import { ContentColumn } from './ContentColumn';
import { IconRail } from './IconRail';
import { Sidebar } from './Sidebar';

export interface AppShellProps {
  children: ReactNode;
}

/**
 * One navigation frame for every viewport: bottom tabs on mobile, an icon
 * rail on tablet, and a single focused content column beside the desktop nav.
 */
export function AppShell({ children }: AppShellProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const theme = useTheme();
  const themedRoot = [
    styles.root,
    { backgroundColor: theme.colors.background },
  ];

  if (isMobile) {
    return (
      <View style={themedRoot}>
        <View style={styles.fill}>{children}</View>
        <BottomTabs />
      </View>
    );
  }

  return (
    <View style={[themedRoot, styles.row]}>
      {isTablet ? <IconRail /> : <Sidebar />}
      <ContentColumn>{children}</ContentColumn>
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
