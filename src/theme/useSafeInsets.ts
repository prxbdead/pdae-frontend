import { useContext } from 'react';
import {
  SafeAreaInsetsContext,
  type EdgeInsets,
} from 'react-native-safe-area-context';

const NO_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };

/**
 * Safe-area insets that fall back to zero when no provider is mounted (web,
 * unit tests, isolated component renders) instead of throwing.
 */
export function useSafeInsets(): EdgeInsets {
  return useContext(SafeAreaInsetsContext) ?? NO_INSETS;
}
