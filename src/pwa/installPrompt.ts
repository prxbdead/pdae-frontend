import { Platform } from 'react-native';

/** The non-standard event Chromium fires when the app can be installed. */
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let captured = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function isStandalone(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches
  );
}

/**
 * Listens for `beforeinstallprompt` and holds the event until the learner asks
 * to install from Settings. The browser fires this event early, often before
 * any React screen mounts, so the root layout calls this at module load.
 * Safe to call repeatedly; native platforms do nothing.
 */
export function captureInstallPrompt(): void {
  if (captured || Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  captured = true;

  window.addEventListener('beforeinstallprompt', (event: Event) => {
    // Suppress the mini-infobar so the install action lives in Settings.
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

export function subscribeInstallPrompt(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

/** True when the app can be installed now and is not already running installed. */
export function canInstallNow(): boolean {
  return deferredPrompt !== null && !isStandalone();
}

/**
 * Shows the browser install dialog. The prompt can be used once, so the held
 * event is cleared after the learner answers.
 */
export async function runInstallPrompt(): Promise<void> {
  const event = deferredPrompt;

  if (!event) {
    return;
  }

  deferredPrompt = null;
  notify();
  await event.prompt();
  await event.userChoice;
}

/** Test-only reset so each test starts with no captured event. */
export function resetInstallPromptForTests(): void {
  deferredPrompt = null;
  captured = false;
  listeners.clear();
}
