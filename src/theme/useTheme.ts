import { createContext, useContext } from 'react';

import type { ThemeMode } from '@/stores/settingsStore';

import type { Theme } from './themes';

export type ResolvedThemeMode = 'light' | 'dark';

export interface ThemeContextValue extends Theme {
  mode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }

  return value;
}
