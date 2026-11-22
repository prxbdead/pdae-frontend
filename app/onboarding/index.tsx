import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { useSessionStore } from '@/auth/sessionStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useTheme } from '@/theme/useTheme';

/**
 * Temporary landing for the onboarding route. The resumable eight-step flow
 * replaces this screen in the next task; until then it keeps the redirect
 * target real and lets the shell be reached.
 */
export default function OnboardingLanding() {
  const theme = useTheme();
  const router = useRouter();
  const markCompleted = useOnboardingStore((state) => state.markCompleted);
  const status = useSessionStore((state) => state.status);
  const authenticated = status === 'authenticated';

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.lg,
          },
        ]}
      >
        <Text
          style={[theme.typography.display, { color: theme.colors.primary }]}
        >
          Hodlo
        </Text>
        <Text
          style={[theme.typography.heading, { color: theme.colors.text }]}
        >
          Set up your profile
        </Text>
        <Text
          style={[theme.typography.body, { color: theme.colors.textMuted }]}
        >
          {authenticated
            ? 'The step-by-step setup arrives next. Continue to the app for now.'
            : 'The step-by-step setup arrives next. Sign in to continue.'}
        </Text>

        {authenticated ? (
          <Button
            label="Continue to the app"
            fullWidth
            onPress={() => {
              markCompleted();
              router.replace('/(tabs)/learn');
            }}
          />
        ) : (
          <>
            <Button
              label="Log in"
              fullWidth
              onPress={() => router.push('/login')}
            />
            <Button
              label="Create account"
              variant="ghost"
              fullWidth
              onPress={() => router.push('/register')}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderWidth: 1,
    gap: 16,
    maxWidth: 440,
    padding: 24,
    width: '100%',
  },
});
