import { useColorScheme } from 'react-native';
import { useMemo, type ReactNode } from 'react';

import { useSettingsStore, type ThemeMode } from '@/stores/settingsStore';

import { darkTheme, lightTheme } from './themes';
import {
  ThemeContext,
  type ResolvedThemeMode,
  type ThemeContextValue,
} from './useTheme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((state) => state.themeMode);
  const setSetting = useSettingsStore((state) => state.setSetting);

  const mode: ResolvedThemeMode =
    themeMode === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : themeMode;

  const value = useMemo<ThemeContextValue>(() => {
    const theme = mode === 'dark' ? darkTheme : lightTheme;

    return {
      ...theme,
      mode,
      setMode: (nextMode: ThemeMode) => setSetting('themeMode', nextMode),
    };
  }, [mode, setSetting]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
