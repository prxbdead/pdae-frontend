import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { UpdateBanner } from '@/components/pwa/UpdateBanner';
import { useRootRedirect } from '@/auth/rootRedirect';
import { AppProviders } from '@/providers/AppProviders';
import { captureInstallPrompt } from '@/pwa/installPrompt';
import { initWebPwa } from '@/pwa/registerServiceWorker';
import { useAppFonts } from '@/theme/fonts';

void SplashScreen.preventAutoHideAsync().catch(() => {
  // The splash screen is already hidden or unavailable; nothing to do.
});

// Capture beforeinstallprompt before any screen mounts; the browser may fire it
// during the first page load. The PWA head and worker registration also run
// here, once per web page load.
captureInstallPrompt();
initWebPwa();

function RootNavigator() {
  useRootRedirect();

  return (
    <>
      <StatusBar style="auto" />
      <UpdateBanner />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  const { loaded, error } = useAppFonts();

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync().catch(() => {
        // Hiding twice is harmless.
      });
    }
  }, [loaded]);

  useEffect(() => {
    if (error) {
      console.warn('Nunito failed to load; using system fonts.', error);
    }
  }, [error]);

  // Keep the native splash up until fonts resolve, but never block the app on
  // a font failure.
  if (!loaded && !error) {
    return null;
  }

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
