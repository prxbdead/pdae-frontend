/*
 * Loaded into the generated service worker through workbox-config.js
 * (importScripts). Workbox does not handle SKIP_WAITING itself when
 * skipWaiting is false, so the page posts this message after the learner taps
 * "Refresh" on the update banner (see src/pwa/useServiceWorkerUpdate.ts).
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
