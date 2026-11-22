import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Placeholder splash screen. Task 8 replaces this with the session and
 * onboarding redirect guard.
 */
export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.wordmark}>Hodlo</Text>
      <ActivityIndicator color="#6C4CF1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#F5F2FF',
  },
  wordmark: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '900',
    color: '#1E1538',
  },
});
