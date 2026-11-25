import { Platform } from 'react-native';

/**
 * `web.output: "single"` renders the SPA template and ignores app/+html.tsx,
 * so the PWA head tags and worker registration run from the web bundle.
 */

export const SERVICE_WORKER_URL = '/sw.js';

const MANIFEST_HREF = '/manifest.json';
const APPLE_TOUCH_ICON_HREF = '/icons/icon-192.png';

/** Adds the manifest and iOS icon links if the template did not include them. */
export function ensureWebAppHead(doc: Document = document): void {
  const head = doc.head;

  if (!head.querySelector('link[rel="manifest"]')) {
    const manifest = doc.createElement('link');

    manifest.rel = 'manifest';
    manifest.href = MANIFEST_HREF;
    head.appendChild(manifest);
  }

  if (!head.querySelector('link[rel="apple-touch-icon"]')) {
    const icon = doc.createElement('link');

    icon.rel = 'apple-touch-icon';
    icon.href = APPLE_TOUCH_ICON_HREF;
    head.appendChild(icon);
  }
}

/**
 * Registers the Workbox worker once the page has loaded. Only production
 * builds register, so the dev server never serves a cached app shell.
 */
export function registerServiceWorker(
  container: ServiceWorkerContainer | undefined = getContainer(),
): Promise<ServiceWorkerRegistration | undefined> {
  if (!container) {
    return Promise.resolve(undefined);
  }

  return container.register(SERVICE_WORKER_URL).catch((error: unknown) => {
    console.warn('Service worker registration failed.', error);

    return undefined;
  });
}

function getContainer(): ServiceWorkerContainer | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return (navigator as { serviceWorker?: ServiceWorkerContainer }).serviceWorker;
}

/**
 * Entry point called from the root layout. Does nothing on native, and does
 * nothing when the page has no DOM.
 */
export function initWebPwa(): void {
  if (
    Platform.OS !== 'web' ||
    typeof document === 'undefined' ||
    typeof window === 'undefined'
  ) {
    return;
  }

  ensureWebAppHead();

  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  if (document.readyState === 'complete') {
    void registerServiceWorker();
  } else {
    window.addEventListener('load', () => {
      void registerServiceWorker();
    });
  }
}
