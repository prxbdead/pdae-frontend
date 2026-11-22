import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/useTheme';

export interface AppProvidersProps {
  children: ReactNode;
}

function ThemedSurface({ children }: AppProvidersProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      {children}
    </View>
  );
}

/**
 * Root provider stack. Later tasks add the API, content, sync, and auth
 * providers inside ThemeProvider.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedSurface>{children}</ThemedSurface>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
