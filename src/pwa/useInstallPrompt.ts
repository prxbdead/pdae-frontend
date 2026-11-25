import { useCallback, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import {
  canInstallNow,
  runInstallPrompt,
  subscribeInstallPrompt,
} from './installPrompt';

export interface InstallPrompt {
  /** True only on web, when the browser has offered an install and the app is not installed yet. */
  canInstall: boolean;
  promptInstall(): Promise<void>;
}

const NATIVE: InstallPrompt = {
  canInstall: false,
  promptInstall: async () => undefined,
};

function subscribe(listener: () => void) {
  return subscribeInstallPrompt(listener);
}

function getSnapshot() {
  return canInstallNow();
}

function getServerSnapshot() {
  return false;
}

/**
 * Exposes the deferred `beforeinstallprompt` event to the UI. Native platforms
 * never show an install action, so the Settings row stays hidden there.
 */
export function useInstallPrompt(): InstallPrompt {
  const canInstall = useSyncExternalStore(
    Platform.OS === 'web' ? subscribe : noopSubscribe,
    Platform.OS === 'web' ? getSnapshot : getServerSnapshot,
    getServerSnapshot,
  );

  const promptInstall = useCallback(() => runInstallPrompt(), []);

  if (Platform.OS !== 'web') {
    return NATIVE;
  }

  return { canInstall, promptInstall };
}

function noopSubscribe() {
  return () => undefined;
}
