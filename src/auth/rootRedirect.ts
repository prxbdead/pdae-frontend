import { usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useSessionStore } from '@/auth/sessionStore';

/**
 * Single owner of the session routing rules. Anonymous visitors only see the
 * auth flow; authenticated users are kept out of it and off the splash.
 */
export function useRootRedirect(): void {
  const status = useSessionStore((state) => state.status);
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    const inAuth = segments[0] === '(auth)';

    if (status === 'anonymous') {
      if (inAuth) {
        return;
      }

      // The landing route has no useful destination to return to.
      if (pathname !== '/') {
        useSessionStore.getState().setReturnTo(pathname);
      }

      router.replace('/login');

      return;
    }

    if (inAuth || pathname === '/') {
      router.replace('/(tabs)/learn');
    }
  }, [status, segments, pathname, router]);
}
