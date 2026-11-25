import type { ViewStyle } from 'react-native';

import { breakpoints, spacing } from '@/theme/tokens';

/**
 * Shared scroll-content style for tab screens so every page has the same
 * gutter, rhythm, and reading width.
 */
export const screenContent: ViewStyle = {
  alignSelf: 'center',
  gap: spacing.md,
  maxWidth: breakpoints.contentWidth,
  padding: spacing.md,
  paddingBottom: spacing.xxl,
  width: '100%',
};
