/**
 * Service worker build config, run by `workbox generateSW` after
 * `expo export -p web` (see `build:web` in package.json).
 *
 * What gets cached:
 *   - Precache: the exported app shell and static assets in dist/.
 *   - /content/pack: NetworkFirst, falls back to cache after 3 s.
 *   - Same-origin static images, fonts, and 3D assets: CacheFirst.
 *
 * What never gets cached by the service worker:
 *   - /auth/* (credentials and session responses).
 *   - Non-GET requests (Workbox only matches GET by default; the guard below
 *     states it explicitly).
 *   - User-specific API responses. TanStack Query persists those in app
 *     storage and clears them on sign-out, so one learner's data cannot reach
 *     the next learner on the same device.
 *
 * Bump HODLO_CACHE_VERSION on every deploy. It sets the precache name prefix,
 * so the new worker installs a fresh precache and deletes the previous one.
 * Runtime cache names (hodlo-content, hodlo-assets) stay stable and rely on
 * their expiration limits.
 */

const CACHE_VERSION = process.env.HODLO_CACHE_VERSION ?? 'hodlo-v1';

module.exports = {
  globDirectory: 'dist',
  globPatterns: ['**/*.{js,css,html,png,svg,woff2,json}'],
  swDest: 'dist/sw.js',
  cacheId: CACHE_VERSION,
  navigateFallback: '/index.html',
  // The page decides when to activate a new worker (see sw-skip-waiting.js).
  skipWaiting: false,
  clientsClaim: true,
  importScripts: ['sw-skip-waiting.js'],
  runtimeCaching: [
    {
      urlPattern: /\/auth\//,
      handler: 'NetworkOnly',
      method: 'GET',
    },
    {
      urlPattern: /\/content\/pack/,
      handler: 'NetworkFirst',
      method: 'GET',
      options: {
        cacheName: 'hodlo-content',
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 10, maxAgeSeconds: 2592000 },
      },
    },
    {
      // Workbox serializes this function into sw.js, so it must not close over
      // anything defined in this file.
      urlPattern: ({ url, request }) =>
        request.method === 'GET' &&
        url.origin === self.location.origin &&
        /\.(png|jpg|jpeg|svg|woff2|glb|gltf)$/.test(url.pathname),
      handler: 'CacheFirst',
      method: 'GET',
      options: {
        cacheName: 'hodlo-assets',
        expiration: { maxEntries: 60, maxAgeSeconds: 2592000 },
      },
    },
  ],
};
