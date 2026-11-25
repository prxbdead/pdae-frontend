import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

/**
 * Landing route. `useRootRedirect` owns the actual destination, so this is
 * only the splash shown until the session cache has been read.
 */
export default function Index() {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text
        style={[
          theme.typography.display,
          styles.wordmark,
          { color: theme.colors.primary },
        ]}
      >
        Hodlo
      </Text>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  wordmark: {
    letterSpacing: -1,
  },
});
