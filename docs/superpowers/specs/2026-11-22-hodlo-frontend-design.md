# Hodlo frontend — design decisions

Date: 2026-11-22
Status: proposed for review
Product name in UI: **Hodlo**. Repo/package identifiers stay `PDAE` until a
rename is explicitly requested.

## Intent

Build the Hodlo learner client as one TypeScript codebase that runs as:

- an installable web app (PWA) on desktop and mobile browsers, and
- an Android app built from the same React Native codebase.

The client must stay useful on a flaky or absent connection. Core learning —
opening a downloaded lesson, answering questions, seeing feedback, and finishing
a lesson — must work offline. Progress is saved locally and reconciled with the
.NET backend when the network returns.

The backend and frontend are developed in parallel. Neither side waits for the
other: the frontend ships against a typed contract and an in-memory mock adapter;
the backend implements the same contract. The contract is the merge seam.

## Goals (v1)

- Complete frontend issues **#1–#11**.
- Universal app: Android + web/PWA from Expo SDK 58 / React Native 0.88.
- Design system from the Hodlo plan: palette, type scale, spacing, radii,
  ledges, light/dark, reduced motion.
- Onboarding, Learn path, lesson engine, results, Practice, Leaderboard,
  Profile, Settings, glossary, disclaimer.
- Offline-first lessons with a persisted outbox and idempotent sync.
- WCAG AA contrast, keyboard support on web, screen-reader labels, reduced
  motion, no drag-only interactions.
- Mascot slot that is ready for 3D characters later, with a static placeholder
  now. No dependency on the early Rive/owl animation work.

## Non-goals (v1)

- Real-time 3D character rigs and the full five-character animation set.
- Leagues promotion/demotion beyond displaying the backend ladder; Quests,
  Shop, Friends, and push notification delivery.
- Real-money trading. The simulator is paper-only.
- Modular avatar builder, 20+ achievement art set, 8–12 illustrated unit
  banners, original sound set.
- Native iOS release (Expo keeps it buildable; it is not a v1 target).

These are deliberately deferred; the interfaces below leave room for them.

## Constraints

- **Runtime:** Expo SDK 58, React Native 0.88, React 19.3, Node 22.13+.
- **Web:** React Native Web 0.21, Expo Router, Metro, static export, Workbox
  service worker.
- **Styling:** design tokens in TypeScript + `StyleSheet`. No Tailwind, no
  Framer Motion. Reanimated handles press/reward motion. This follows frontend
  issue #1's "React Native navigation and StyleSheet-based styling" decision.
- **Backend:** .NET 10, PostgreSQL, cookie-based auth (backend issues #6–#9),
  server-side quiz scoring (issues #16–#18), weekly leaderboard (issue #21),
  achievements (issue #22), virtual portfolio/trades (issues #23–#26).
- **Offline:** bundled content pack, local progress, persisted outbox,
  idempotent attempt submission.
- **Accessibility:** WCAG AA; 44×44 minimum touch targets; visible focus on web;
  no meaning carried by color alone.
- **Content:** educational only; no price predictions, no "buy this" language,
  no real token endorsements. Visible disclaimer. Paper trading only.
- **Originality:** no Duolingo assets, wording, sound files, or character
  construction.

## Offline behaviour (what actually works without a connection)

The client is local-first for learning, not "offline everything". This table is
the contract the UI must express; screens never fail silently or claim a save
that did not happen.

| Action | Works offline | Behaviour |
| --- | --- | --- |
| Open the app and browse the Learn path | Yes | Served from the bundled/cached content pack + local progress. |
| Play a lesson and see feedback | Yes | Graded locally from the bundled answer key. |
| Finish a lesson | Yes | Result saved locally, XP/streak shown as pending, attempt queued in the outbox. |
| Resume a lesson after restart or refresh | Yes | Session persisted under `hodlo:v1:lesson-session`. |
| Read the glossary, disclaimer, settings | Yes | Bundled text. |
| View the last leaderboard / profile / portfolio | Yes, cached | Explicit “last synced” timestamp; no refresh spinner. |
| Sync XP, streak, hearts, achievements | Deferred | Flushes on reconnect, app foreground, or next launch; exactly once. |
| Sign in for the first time on a device | **No** | One online sign-in is required; onboarding says so plainly instead of failing at submit. |
| Create an account / complete onboarding | **No** | Account step shows “Connect to create your account” and keeps the answers saved. |
| Place a paper trade | **No** | Trading is read-only offline; the server owns the portfolio. |
| Update profile, delete account, change password | **No** | Disabled with an inline reason when offline. |
| Receive reminders / push | **No** | Delivery is v1.1; v1 only stores preferences. |

Rules:

- A cached session keeps offline lessons playable; a 401 pauses sync without
discarding queued attempts.
- Sign-out clears user-scoped local data (progress, outbox, session, query
  cache) but never the content pack or settings, so the next user starts clean
  and the app still opens offline.
- Local grading is optimistic. The server re-scores and is authoritative for XP,
  streaks, hearts, and achievements; the client reconciles by
  `clientAttemptId` and never applies the same attempt twice.
- Every pending state is visible (“Saved offline — will sync”), never implied.

## Approaches considered

### A. Expo universal app — recommended

Keep the existing React Native 0.88 repo, add Expo SDK 58 and Expo Router, and
build web through React Native Web. One component tree, one navigation tree,
one test suite. Web gets real URLs and static export; Android gets a native
build through Expo prebuild/EAS. Expo SDK 58 targets RN 0.88 exactly.

Tradeoffs: the web bundle is heavier than a pure React site; a few web-specific
behaviours (focus rings, keyboard shortcuts, service worker, install prompt)
need `.web.tsx` files. 3D on native is the hardest part and is deferred behind
an interface.

### B. Pure web app (Vite/Next) + Capacitor Android wrapper

Closest to the original app plan's stack (React + Tailwind + Framer Motion),
best web performance and simplest PWA. But it discards the initialized React
Native repo, weakens native feel, and contradicts frontend issue #1. Android
becomes a WebView wrapper rather than a native app.

Not chosen.

### C. Bare React Native + react-native-web

Keeps native builds and avoids Expo. But web bundling, routing, fonts, PWA, and
service worker setup are manual and fragile; Expo is the maintained path for
this exact RN version.

Not chosen.

## Decisions

### D1. Universal Expo app

Use Expo SDK 58 + Expo Router. Route groups:

- `(auth)` — login/register
- `onboarding` — public, resumable
- `(tabs)` — Learn, Practice, Leagues, Profile
- `lesson/[lessonId]` — intro, play, result
- `settings`, `glossary`, `disclaimer`, `dev/health`

The custom `AppShell` renders a bottom tab bar below 768 px, an icon rail from
768–1099 px, and a sidebar at 1100 px and up. Center content is capped at 600 px
(720 px for lessons). There is no right-hand rail at any breakpoint.

### D2. Typed contract + mock adapter

`src/api/contracts.ts` defines Zod schemas and inferred TypeScript types for all
endpoints. `ApiClient` has two implementations:

- `HttpApiClient` — real backend, cookies, credentials, idempotency keys.
- `MockApiClient` — in-memory fixtures, used when
  `EXPO_PUBLIC_API_MODE=mock` (default in development).

`docs/api-contract.md` is the handshake document for the backend. Backend
issues map to contract sections; additions required for offline are marked
**NEW**.

### D3. Local-first content and progress

A versioned JSON content pack is bundled with the app. It contains modules,
lessons, exercises, and **answer keys** so lessons can be graded offline.
Online lesson responses do not expose answers; the bundled/offline pack does.

On completion:

1. Grade locally, show immediate feedback.
2. Save the result locally and update XP/streak/daily goal optimistically.
3. Enqueue an attempt in a persisted outbox with a client-generated
   `clientAttemptId`.
4. Sync when online. The server re-scores and returns the authoritative result;
   the client reconciles. Duplicate submissions return the original result
   (idempotency).

This is a deliberate tradeoff: offline grading requires the answer key on the
device. The server remains authoritative for XP, streaks, hearts, and
achievements. The content is educational, not a proctored exam.

### D4. Auth

Cookie-based, matching backend issue #8. Web uses `credentials: 'include'` and
an explicit CORS origin with credentials. Native relies on the platform cookie
store; Task 8 verifies this on the Android emulator. If native cookie
persistence fails, the fallback is a SecureStore bearer token, coordinated with
the backend — not an independent auth scheme.

Offline behaviour: a cached session allows downloaded lessons to be played and
results queued. Sync pauses on 401 and prompts re-login; queued results are
kept.

### D5. Mascot slot, not a mascot engine

`Mascot` is a platform-neutral interface:

```ts
type MascotMood =
  | 'idle' | 'happy' | 'celebrate' | 'think' | 'sad' | 'shock' | 'sleep';

interface MascotProps {
  character: CharacterId;
  mood: MascotMood;
  intensity?: number; // 0..1
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
}
```

v1 ships `MascotPlaceholder` (colored character tile with name/catchphrase) and
`MascotBoundary` (error fallback). The slot reserves a 1:1 aspect ratio so a 3D
canvas or video cannot shift layout. `Mascot.web.tsx` and `Mascot.native.tsx`
are the future 3D seams.

The character animation spec in the app plan (§4: Rive rigs, ~14 clips per
character, lip-sync mouth layers) is **not** being implemented. The early 2D
animation work is abandoned in favour of 3D characters, so v1 must not build a
Rive/Lottie pipeline, a viseme layer, or a rig that assumes layered 2D art. What
survives is the vocabulary: `MascotMood`, `intensity`, and the per-moment
character rotation are the contract between the app and whichever renderer
ships later.

For 3D, the order is fixed: **pre-rendered clips first** (a sprite sheet or
transparent video per mood), real-time glTF on web via react-three-fiber second,
and native real-time only if profiling justifies it. Pre-rendered clips are the
default because they behave on low-end Android, work offline, and add nothing to
the initial JS bundle. Real-time 3D stays behind `Mascot.web.tsx` /
`Mascot.native.tsx` with a dynamic import; the placeholder remains the fallback
on load error, offline, or reduced motion. The 3D work is post-v1.

### D6. Scope split

**v1** = frontend issues #1–#11 plus the offline/PWA requirements above.

**v1.1** = Quests, Shop, Friends, notification delivery, avatar builder,
additional unit art.

**v2** = 3D mascots, sound set, leagues polish, full content (8–12 units).

## API contract summary

Full details live in `docs/api-contract.md`, created by Task 6. Endpoints:

| Area | Endpoints | Backend issue |
| --- | --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` | #7, #8 |
| User | `GET /users/me`, `PUT /users/me` | #9 |
| Content | `GET /modules`, `GET /modules/{id}/lessons`, `GET /lessons/{id}` | #11, #12 |
| Offline pack | `GET /content/pack?version=` **NEW** | #12, #14 |
| Progress | `GET /users/me/progress` **NEW** | #13 |
| Attempts | `POST /quiz-attempts` with `Idempotency-Key` **NEW header** | #16–#18 |
| XP/streak | included in attempt result and `GET /users/me` | #19, #20 |
| Leaderboard | `GET /leaderboard?period=weekly` | #21 |
| Achievements | `GET /achievements` | #22 |
| Market | `GET /market/quotes?symbols=` | #23 |
| Portfolio | `GET /portfolio` | #26 |
| Trades | `POST /trades` with `Idempotency-Key` **NEW header** | #25 |
| Health | `GET /health` | existing |

Error shape: ASP.NET Core `ProblemDetails` (`type`, `title`, `status`,
`detail`, `errors`). The client maps `detail` to user-facing messages and keeps
the status for retry decisions.

CORS: allow the deployed web origin and `http://localhost:8081` with
credentials. `AllowAnyOrigin` cannot be used with credentials (backend issue
#5).

## Success criteria

- A new learner can complete onboarding, play the first lesson, see results,
  and return to the Learn path on web and Android.
- With the network disabled after content is downloaded, a learner can complete
  a lesson, see feedback, and later sync the result exactly once.
- The web build is installable, has an offline shell, and survives a refresh on
  a lesson URL.
- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build:web`
  pass in CI.
- Keyboard-only and reduced-motion paths work on web.

## Open questions for review

1. Confirm Expo SDK 58 + Expo Router (approach A) rather than a pure web app.
2. Confirm v1 scope = frontend issues #1–#11; Quests/Shop/Friends/push and 3D
   are deferred.
3. Confirm the offline answer-key tradeoff (D3), or require online-only grading
   and accept that offline lessons cannot show feedback.
4. Confirm the UI name **Hodlo** while repo/package identifiers stay `PDAE`.
5. Confirm 3D direction after v1 (pre-rendered clips vs real-time).
