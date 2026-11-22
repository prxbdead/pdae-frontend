import { usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useSessionStore } from '@/auth/sessionStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

/**
 * Single owner of the session/onboarding routing rules. Navigation is
 * declarative: screens never decide whether the user is allowed to be there.
 */
export function useRootRedirect(): void {
  const status = useSessionStore((state) => state.status);
  const onboardingCompleted = useOnboardingStore((state) => state.completed);
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const onSplash = pathname === '/';

    if (status === 'anonymous') {
      if (inAuth || inOnboarding) {
        return;
      }

      if (!onboardingCompleted) {
        router.replace('/onboarding');

        return;
      }

      useSessionStore.getState().setReturnTo(pathname);
      router.replace('/login');

      return;
    }

    if (!onboardingCompleted) {
      if (!inOnboarding) {
        router.replace('/onboarding');
      }

      return;
    }

    if (inAuth || inOnboarding || onSplash) {
      router.replace('/(tabs)/learn');
    }
  }, [status, onboardingCompleted, segments, pathname, router]);
}
