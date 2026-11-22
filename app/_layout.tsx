import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useRootRedirect } from '@/auth/rootRedirect';
import { AppProviders } from '@/providers/AppProviders';
import { useAppFonts } from '@/theme/fonts';

void SplashScreen.preventAutoHideAsync().catch(() => {
  // The splash screen is already hidden or unavailable; nothing to do.
});

function RootNavigator() {
  useRootRedirect();

  return (
    <>
      <StatusBar style="auto" />
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
