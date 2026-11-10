/**
 * PDAE mobile app
 *
 * @format
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { API_BASE_URL, getHealth } from './src/api/client';

type ConnectionState =
  | { status: 'checking' }
  | { status: 'online'; timestamp: string }
  | { status: 'offline'; message: string };

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent isDarkMode={isDarkMode} />
    </SafeAreaProvider>
  );
}

function AppContent({ isDarkMode }: { isDarkMode: boolean }) {
  const safeAreaInsets = useSafeAreaInsets();
  const [connection, setConnection] = useState<ConnectionState>({
    status: 'checking',
  });

  const checkConnection = useCallback(async () => {
    setConnection({ status: 'checking' });

    try {
      const health = await getHealth();
      setConnection({ status: 'online', timestamp: health.timestamp });
    } catch (error) {
      setConnection({
        status: 'offline',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: safeAreaInsets.top + 48,
          paddingBottom: safeAreaInsets.bottom + 24,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>PDAE</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        React Native {'0.88'} · .NET 10
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Backend connection
        </Text>

        {connection.status === 'checking' && (
          <View style={styles.row}>
            <ActivityIndicator color={colors.accent} />
            <Text style={[styles.cardText, { color: colors.muted }]}>
              Contacting {API_BASE_URL}
            </Text>
          </View>
        )}

        {connection.status === 'online' && (
          <>
            <View style={styles.row}>
              <View
                style={[styles.dot, { backgroundColor: colors.success }]}
              />
              <Text style={[styles.cardText, { color: colors.text }]}>
                API is online
              </Text>
            </View>
            <Text style={[styles.meta, { color: colors.muted }]}>
              Server time: {new Date(connection.timestamp).toLocaleString()}
            </Text>
          </>
        )}

        {connection.status === 'offline' && (
          <>
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: colors.danger }]} />
              <Text style={[styles.cardText, { color: colors.text }]}>
                API is unreachable
              </Text>
            </View>
            <Text style={[styles.meta, { color: colors.muted }]}>
              {connection.message}
            </Text>
          </>
        )}

        <Text style={[styles.meta, { color: colors.muted }]}>
          Endpoint: {API_BASE_URL}/health
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={checkConnection}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.accent,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Text style={styles.buttonLabel}>Check again</Text>
        </Pressable>
      </View>

      <Text style={[styles.hint, { color: colors.muted }]}>
        Start the API with{'\n'}
        <Text style={[styles.code, { color: colors.text }]}>
          dotnet run --project pdae-backend
        </Text>
      </Text>
    </View>
  );
}

const lightColors = {
  background: '#F6F7FB',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  accent: '#4F46E5',
  success: '#10B981',
  danger: '#EF4444',
};

const darkColors = {
  background: '#0B1020',
  card: '#151C2E',
  text: '#F9FAFB',
  muted: '#9CA3AF',
  accent: '#6366F1',
  success: '#34D399',
  danger: '#F87171',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
  },
  card: {
    marginTop: 32,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  cardText: {
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  meta: {
    fontSize: 13,
  },
  button: {
    marginTop: 4,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    marginTop: 'auto',
    fontSize: 13,
    lineHeight: 20,
  },
  code: {
    fontFamily: 'Menlo',
    fontSize: 12,
  },
});

export default App;
