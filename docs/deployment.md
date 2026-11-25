# Deployment

Issue #11 owns the full deployment guide. This file currently covers the web app
shell (PWA): installability, the service worker, and cache behavior.

## Build

```bash
npm run icons:generate   # only when assets/brand/icon.svg changes
npm run build:web        # expo export -p web, then workbox generateSW
```

`build:web` writes `dist/` with `index.html`, `manifest.json`, `sw.js`, and the
Workbox runtime script.

## Hosting requirements

- **HTTPS is required.** Browsers register service workers only on HTTPS or on
  `localhost`. Install prompts and offline support do not work over plain HTTP.
- **SPA fallback.** Serve `index.html` for unknown paths such as `/lesson/<id>/play`.
  The service worker also falls back to `/index.html` for offline navigations.
- `manifest.json` and `sw.js` must be served from the site root.

## Cache version bump on every deploy

Set `HODLO_CACHE_VERSION` on each production build, for example
`HODLO_CACHE_VERSION=hodlo-2026-12-01 npm run build:web`. The value becomes the
precache name prefix in `sw.js`, so the new worker installs a fresh precache and
removes the previous one. The default (`hodlo-v1`) is for local builds only.
Skipping the bump does not break the app. Workbox still updates changed files by
their revision hash, but the old precache is not removed as a whole.

## Update behavior

- Workbox runs with `skipWaiting: false`. A new worker waits until the learner
  leaves the old page open.
- When a worker is waiting and the page already has a controller, the app shows
  "A new version is ready" with a Refresh button.
- Refresh posts `SKIP_WAITING` to the waiting worker and reloads when it takes
  control. The learner decides when the page changes, so a lesson in progress is
  not replaced mid-answer.
- The first install shows no banner.

## What is cached

| Request | Strategy |
| --- | --- |
| App shell and bundled JS, CSS, HTML, JSON, icons (precache) | Precached at install |
| `/content/pack` | NetworkFirst, 3 s timeout, 10 entries, 30 days |
| Same-origin `.png .jpg .jpeg .svg .woff2 .glb .gltf` | CacheFirst, 60 entries, 30 days |
| `/auth/*` | Never cached (NetworkOnly) |
| POST and other non-GET requests | Never cached |
| User-specific API responses | Never cached by the service worker |

User data stays in app storage, managed by TanStack Query, and is cleared on
sign-out. Caching it in Workbox would expose one learner's data to the next
learner on the same device.

## Install prompt

On Chromium browsers, `beforeinstallprompt` is captured on page load. Settings
shows an "Install app" row only while the browser can install the app. The row
stays hidden on native builds and in an installed (standalone) app.
