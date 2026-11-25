import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { breakpoints } from '@/theme/tokens';

export interface ContentColumnProps {
  children: ReactNode;
  maxWidth?: number;
  testID?: string;
}

/**
 * Centers one reading column. Screens own their own horizontal gutters so
 * headers, banners, and lists share the same left edge.
 */
export function ContentColumn({
  children,
  maxWidth = breakpoints.contentWidth,
  testID,
}: ContentColumnProps) {
  return (
    <View style={styles.outer}>
      <View
        testID={testID ?? 'content-column'}
        style={[styles.column, { maxWidth }]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
  },
  column: {
    flex: 1,
    width: '100%',
  },
});
