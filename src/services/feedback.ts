import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';

export type FeedbackSound = 'tap' | 'correct' | 'wrong' | 'complete';

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
 * Web audio cannot start before a user gesture. The settings screen calls this
 * on first interaction; until then the sound seam stays silent.
 */
let audioUnlocked = Platform.OS !== 'web';

export function unlockAudio(): void {
  audioUnlocked = true;
}

/**
 * No audio assets ship in v1. The seam still reads the setting at call time so
 * turning sound off can never leave a stray cue behind when files land.
 */
const sound = {
  play(_name: FeedbackSound): void {
    if (!useSettingsStore.getState().soundEnabled || !audioUnlocked) {
      return;
    }
  },
};

/**
 * Central feedback service. Sound is a documented no-op until assets exist;
 * haptics respect the settings toggle and are a no-op on web.
 */
export const feedback = {
  tap(): void {
    sound.play('tap');
    void safeHaptic(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    );
  },
  correct(): void {
    sound.play('correct');
    void safeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
  },
  wrong(): void {
    sound.play('wrong');
    void safeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    );
  },
  complete(): void {
    sound.play('complete');
    void safeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
  },
};
