import { useRouter } from 'expo-router';

import { useSessionStore } from '@/auth/sessionStore';
import { AuthHint, AuthScreen } from '@/auth/AuthScreen';
import { Button } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboardingStore';

/**
 * Temporary landing for the onboarding route. The resumable eight-step flow
 * replaces this screen in the next task; until then it keeps the redirect
 * target real and lets the shell be reached.
 */
export default function OnboardingLanding() {
  const router = useRouter();
  const markCompleted = useOnboardingStore((state) => state.markCompleted);
  const status = useSessionStore((state) => state.status);
  const authenticated = status === 'authenticated';

  return (
    <AuthScreen
      headerTitle="Set up your profile"
      title="Welcome to Hodlo"
      subtitle="The step-by-step setup arrives next."
    >
      {authenticated ? (
        <>
          <Button
            label="Continue to the app"
            fullWidth
            onPress={() => {
              markCompleted();
              router.replace('/(tabs)/learn');
            }}
          />
          <AuthHint>
            Your preferences will be collected here in the next step.
          </AuthHint>
        </>
      ) : (
        <>
          <Button
            label="Log in"
            fullWidth
            onPress={() => router.push('/login')}
          />
          <Button
            label="Create account"
            variant="secondary"
            fullWidth
            onPress={() => router.push('/register')}
          />
          <AuthHint>
            Sign in to continue — the setup flow will start here.
          </AuthHint>
        </>
      )}
    </AuthScreen>
  );
}
