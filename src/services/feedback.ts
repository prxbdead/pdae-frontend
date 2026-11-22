import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';

function hapticsEnabled(): boolean {
  if (Platform.OS === 'web') {
    return false;
  }

  return useSettingsStore.getState().hapticsEnabled;
}

async function safeHaptic(run: () => Promise<void>): Promise<void> {
  if (!hapticsEnabled()) {
    return;
  }

  try {
    await run();
  } catch {
    // Haptics are decorative: an unsupported device must never break a lesson.
  }
}

/**
 * Central feedback service. Sound stays a no-op until audio assets exist;
 * haptics respect the settings toggle and are a no-op on web.
 */
export const feedback = {
  tap(): void {
    void safeHaptic(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    );
  },
  correct(): void {
    void safeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
  },
  wrong(): void {
    void safeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    );
  },
  complete(): void {
    void safeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
  },
};
