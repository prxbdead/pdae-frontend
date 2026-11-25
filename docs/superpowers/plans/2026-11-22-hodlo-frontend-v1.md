# Hodlo Frontend v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a universal Hodlo client (Android + installable web/PWA) that completes onboarding, browses the Learn path, plays lessons fully offline, syncs results exactly once, and shows Practice, Leaderboard, and Profile against the .NET backend contract.

**Architecture:** Keep the existing React Native 0.88 repo and make it universal with Expo SDK 58 + Expo Router. One component tree serves Android and web (React Native Web). A typed Zod contract plus an in-memory mock adapter lets the frontend proceed while the backend is built. Lessons are local-first: a bundled content pack with answer keys grades offline, a persisted outbox queues attempts, and the server re-scores and reconciles on sync. A custom `AppShell` provides bottom tabs, tablet rail, and desktop sidebar. The mascot is a platform-neutral slot with a static placeholder now and a 3D seam later.

**Tech Stack:** Expo SDK 58, React Native 0.88, React 19.3, Expo Router, TypeScript strict, Zustand, TanStack Query, AsyncStorage (native key-value store; `localStorage` on web), NetInfo, Zod, React Hook Form, react-native-svg, Reanimated, expo-font, expo-haptics, expo-crypto, expo-image, Jest + React Native Testing Library, Playwright, Maestro, Workbox, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-22-hodlo-frontend-design.md` (frontend decisions) and the user-provided Hodlo app plan. Backend contract source: GitHub issues `prxbdead/pdae-backend` #1–#29; frontend issues `prxbdead/pdae-frontend` #1–#11.

## Global Constraints

- **Palette:** Plum `#1E1538`, Purple `#6C4CF1`, Lilac `#B9A8FF`, Mint `#3DDB80`, Yellow `#FFD84D`, Coral `#FF5A6E`, Fox orange `#F28A3A` (Vex only), neutrals `#F5F2FF`, `#E6E0F7`, `#6B6185`.
- **Ledge shades:** Purple `#4B32C4`, Lilac `#8F7FE0`, Mint `#27A85F`, Yellow `#D9B32E`, Coral `#C93B4D`, Plum `#0F0A1F`, neutral border `#C9BFE8`.
- **Text-on-fill rules:** white on Purple; Plum on Mint, Yellow, Coral, Lilac. Coral is never normal-size white text. Fox orange is allowed only for Vex surfaces and assets.
- **Dark mode:** background `#120D24`, surface `#1E1538`, surface-alt `#2A2048`, border `#3A2E5C`, text `#F5F2FF`, muted `#B9A8FF`.
- **Type scale (one family, Nunito):** Display 40/44 Black, Title 28/32 Bold, Heading 22/28 Bold, Body 16/24 Regular, Caption 13/18 Regular, Button 15/20 ExtraBold uppercase with 0.8 letter-spacing. No ad-hoc sizes.
- **Spacing:** 4, 8, 12, 16, 24, 32, 48, 64. **Radii:** 12, 16, 24, 999. Nothing sharp.
- **Depth:** 4 px bottom ledge, not blur shadows. Pressed state compresses the ledge and moves the surface down 4 px.
- **Motion:** press 120 ms, UI 200 ms, reward 400–900 ms (default 600 ms). Every reward has anticipate → pop → settle. Reduced motion replaces all of it with fades/static poses.
- **Breakpoints:** mobile `<768`, tablet `768–1099`, desktop `≥1100`. Center column max 600 px; lesson card max 720 px.
- **Lesson rules:** 8–12 prompts, 3–5 minutes, 5 hearts per session, 10 XP per first-try correct, +10 perfect bonus, 80% pass threshold. Wrong answers are re-queued once at the end.
- **Offline rules:** after the content pack is present, a lesson must be playable with no network. Every attempt gets a `clientAttemptId`; the outbox survives restart; sync is idempotent; duplicate submissions must not double XP or streak.
- **Auth:** cookie-based, `credentials: 'include'`; web CORS must use explicit origins + credentials, never `AllowAnyOrigin` with credentials. Clear user-specific local data on sign-out.
- **Accessibility:** WCAG AA contrast, 44×44 minimum targets, visible web focus, full keyboard path, screen-reader labels, no drag-only exercise, reduced-motion path, dyslexia-friendly font option (system fallback in v1).
- **Legal/content:** educational only; no price predictions, no “buy this” language, no real token endorsements; visible disclaimer; paper trading only.
- **Originality:** no Duolingo assets, wording, sounds, or character construction.
- **Performance budget:** initial web JS ≤ 400 KB gzip excluding lazy 3D/mascot chunks; lesson interaction feedback < 100 ms; no layout shift from the mascot slot.

## Repo baseline before Task 1

The repo is a bare React Native 0.88 template created with `@react-native-community/cli`, not an Expo app. Task 1 converts it. These template files are superseded and must be deleted as their replacement lands — leaving them in place is what makes the lint/test setup drift:

| Path | Why it goes |
| --- | --- |
| `App.tsx` | Template `/health` screen. Move its UI to `app/dev/health.tsx` (Task 1), then delete. |
| `index.js` | `AppRegistry` entry point; replaced by `"main": "expo-router/entry"`. |
| `__tests__/App.test.tsx` | Renders the deleted `App.tsx`; replaced by the Task 2 smoke test. |
| `.eslintrc.js` | Legacy config. ESLint 9 + flat `eslint.config.js` ignores it inconsistently; delete it in Task 2. |
| `@react-native/eslint-config`, `@react-native/jest-preset` | Template lint/test presets; replaced by `eslint-config-expo` and `jest-expo`. |
| `@react-native/new-app-screen` | Starter-screen dependency, unused once `App.tsx` is gone. |
| `src/api/client.ts` | Only `getHealth()`; moves to `src/api/health.ts` in Task 6 and the file is deleted. |

Keep `react-test-renderer` (React Native Testing Library uses it) and `android/`/`ios/` (Expo prebuild owns them from Task 1 on; do not hand-edit). `README.md` is rewritten in Task 17.

## Review Focus

These are the failure modes most likely to hurt a learner. Each has a test in the owning task.

1. **Offline completion:** network drops after content is downloaded → learner finishes a lesson, sees feedback, sees “saved offline”, and the attempt survives an app restart. (Tasks 7, 11, 13, 17.)
2. **Duplicate sync:** reconnect/retry submits the same attempt twice → server returns the original result, local XP/streak apply once. (Tasks 6, 7, 13.)
3. **Session expiry mid-lesson:** the session expires while the learner is offline and sync runs on reconnect, returning 401 → the lesson continues, the queued result is retained, and re-login resumes sync without losing the attempt. (Tasks 7, 8, 13.)
4. **Web refresh/deep link:** refreshing `/lesson/:id/play` restores the in-progress session and answers; deep-linking while signed out returns to the lesson after login. (Tasks 5, 8, 11, 17.)
5. **Input alternatives:** keyboard-only and reduced-motion learners can complete a lesson; no exercise requires drag; screen readers announce question, feedback, hearts, and progress. (Tasks 4, 11, 12, 16, 17.)

## Scope and GitHub issue alignment

**v1 scope:** frontend issues #1–#11, plus offline sync, PWA, and the typed contract.

These issue edits are **applied** in `prxbdead/pdae-frontend`: all 16 issues are open, written in English, labeled P0/P1, and each body links back to its owning task in this plan. New issues #12–#16 exist as listed at the bottom of the table.

| Issue | Change |
| --- | --- |
| #1 Initialize React Native TypeScript frontend | Retitle to “Initialize universal Expo TypeScript frontend”; body: Expo SDK 58, Expo Router, web/PWA, Android, tokens. Replace “bare RN + React Navigation” wording with Expo Router (built on React Navigation). |
| #2 Shared UI components and navigation | Expand acceptance: tokens, light/dark, three header tiers, bottom tabs/rail/sidebar, Button/Card/Progress/Ring/Sheet/Empty/Offline states, icon registry. |
| #3 Auth pages | Add session store, cookie transport, offline cached session, sign-out clears user data. |
| #4 Onboarding and Home page | Split “Home” into the Learn path (#5); this issue covers splash, level, interests, goal, cast, placement, account, notification soft ask. |
| #5 Learn and Lesson pages | Keep Learn path + lesson intro; move the playable engine to new issue #12. |
| #6 Quiz and Result pages | Split: new #12 lesson engine; this issue covers feedback sheet, hearts-out, result, XP/streak/daily goal/level-up. |
| #7 Leaderboard and Profile pages | Add achievements and offline cached leaderboard. |
| #8 Practice page | Add mistakes review, practice lesson reuse, paper-trading portfolio/trade sheet with offline queue. |
| #9 Add frontend tests | Specify Jest/RNTL unit+component, Playwright web E2E, Maestro Android smoke, offline sync tests. |
| #10 Configure frontend GitHub Actions CI | Add lint, typecheck, test, web build, bundle-size check, Playwright job; Android EAS build manual. |
| #11 Prepare frontend deployment and documentation | Add PWA/service worker, env vars, CORS handshake, static hosting, EAS Android, README. |
| **New #12** | Implement lesson engine and offline attempts (split from #6). |
| **New #13** | Implement offline content pack, outbox, and sync engine. |
| **New #14** | Implement PWA shell and service worker. |
| **New #15** | Define typed API contract and mock adapter (backend merge seam). |
| **New #16** | Mascot slot and 3D integration spike (post-v1 implementation). |

**Deferred to v1.1/v2:** Quests, Shop, Friends, push delivery, avatar builder, chest reward logic, 8–12 unit art set, original sound set, real-time 3D rigs, iOS release.

## File structure (created by this plan)

```
app/
  _layout.tsx                     # providers + root redirect guard
  index.tsx                       # splash/redirect
  +not-found.tsx
  +html.tsx                       # web head, PWA manifest, SW registration
  (auth)/_layout.tsx
  (auth)/login.tsx
  (auth)/register.tsx
  onboarding/_layout.tsx
  onboarding/index.tsx            # welcome
  onboarding/level.tsx
  onboarding/interests.tsx
  onboarding/goal.tsx
  onboarding/cast.tsx
  onboarding/placement.tsx
  onboarding/account.tsx
  onboarding/notifications.tsx
  (tabs)/_layout.tsx              # AppShell + Slot
  (tabs)/learn.tsx
  (tabs)/practice.tsx
  (tabs)/leagues.tsx
  (tabs)/profile.tsx
  lesson/[lessonId]/index.tsx     # intro
  lesson/[lessonId]/play.tsx
  lesson/[lessonId]/result.tsx
  practice/mistakes.tsx
  practice/trading.tsx
  settings.tsx
  glossary.tsx
  disclaimer.tsx
  dev/health.tsx                  # existing health check, dev-only
src/
  api/
    contracts.ts                  # Zod schemas + inferred types
    errors.ts
    config.ts
    http.ts
    mock.ts
    fixtures.ts
    queryClient.ts
    ApiProvider.tsx
    health.ts
    index.ts
  auth/
    sessionStore.ts
    AuthProvider.tsx
    useSession.ts
    validation.ts
    rootRedirect.ts
  components/
    ui/                           # Button, Card, ProgressBar, ProgressRing,
                                  # Badge, Chip, Icon, Sheet, EmptyState,
                                  # OfflineBanner, PageHeader, Skeleton
    layout/                       # AppShell, Sidebar, BottomTabs,
                                  # ContentColumn
    mascot/                       # Mascot(.web/.native), MascotPlaceholder,
                                  # MascotBoundary, MascotSlot, types.ts
    a11y/                         # SkipLink.web.tsx, SkipLink.native.tsx
    pwa/                          # UpdateBanner.tsx
  content/
    schema.ts
    repository.ts
    ContentProvider.tsx
    glossary.ts
    packs/hodlo-pack-v1.json
    fixtures/pack.ts
  features/
    onboarding/
    learn/
    lesson/
    practice/
    trading/
    leagues/
    profile/
    achievements/
    settings/
    glossary/
    legal/                        # DisclaimerScreen
    gamification/                 # streak, dailyGoal, xp, achievements
  offline/
    storage.ts
    outbox.ts
    sync.ts
    SyncProvider.tsx
    syncStatusStore.ts
    useSyncStatus.ts
  pwa/
    useServiceWorkerUpdate.ts
    useInstallPrompt.ts
  services/
    feedback.ts
  stores/
    settingsStore.ts
    progressStore.ts
    onboardingStore.ts
  theme/
    tokens.ts
    themes.ts
    ThemeProvider.tsx
    useTheme.ts
    useBreakpoint.ts
    useReducedMotion.ts
    contrast.ts
    fonts.ts
  hooks/
    useKeyboardShortcuts.ts
    useFocusRing.ts
  assets/icons/                   # one react-native-svg component per IconName
  navigation/tabs.ts
  types/                          # shared domain types (CharacterId, etc.)
public/
  manifest.json
  icons/icon-192.png
  icons/icon-512.png
  sw.js                           # generated into dist, not committed
scripts/
  generate-pwa-icons.mjs
  check-bundle-size.mjs
assets/
  brand/icon.svg
  favicon.png
docs/
  api-contract.md
  deployment.md
  superpowers/specs/2026-11-22-hodlo-frontend-design.md
  superpowers/plans/2026-11-22-hodlo-frontend-v1.md
e2e/
  web/smoke.spec.ts
  web/lesson.spec.ts
  web/offline.spec.ts
  web/deep-link.spec.ts
  web/a11y.spec.ts
maestro/
  smoke.yaml
  onboarding.yaml
.github/workflows/ci.yml
```

## Task 1: Universal Expo foundation

**Files:**
- Modify: `package.json`, `app.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `.gitignore`
- Delete: `index.js` (Expo Router entry replaces it), `App.tsx` after moving the health screen, `__tests__/App.test.tsx` (replaced by the Task 2 smoke test)
- Create: `app/_layout.tsx`, `app/index.tsx`, `app/dev/health.tsx`, `.env.example`, `expo-env.d.ts`

**Interfaces:**
- Consumes: existing `src/api/client.ts` `getHealth()`.
- Produces: Expo Router entry (`main: "expo-router/entry"`), `app/_layout.tsx` root Stack, `app/index.tsx` redirect, `/dev/health` screen, scripts `start`, `android`, `web`, `typecheck`, `lint`, `test`, `build:web`.

- [ ] **Step 1: Create a branch and install Expo modules**

```bash
git checkout -b feat/expo-universal
npx install-expo-modules@latest
```

Review `git diff` before continuing. If the command fails, re-scaffold in `/tmp/hodlo-expo` with `npx create-expo-app@latest --template blank-typescript`, copy its Expo config (`babel.config.js`, `metro.config.js`, `app.json`, `tsconfig.json`), and keep this repo's `src/` and `android/`.

- [ ] **Step 2: Install runtime dependencies**

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens \
  expo-linking expo-constants expo-status-bar react-dom react-native-web \
  @expo/metro-runtime expo-font expo-splash-screen expo-system-ui \
  react-native-svg react-native-reanimated react-native-gesture-handler \
  @react-native-async-storage/async-storage @react-native-community/netinfo \
  expo-haptics expo-crypto expo-image
npm install zustand @tanstack/react-query @tanstack/react-query-persist-client \
  @tanstack/query-async-storage-persister zod react-hook-form @hookform/resolvers \
  @expo-google-fonts/nunito
```

- [ ] **Step 3: Configure the universal app**

`package.json`: set `"main": "expo-router/entry"`, `"engines": { "node": ">=22.13.0" }`, and scripts:

```json
{
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "web": "expo start --web",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "jest",
  "test:e2e": "playwright test",
  "build:web": "expo export -p web"
}
```

`app.json`: set `name` to `Hodlo`, `slug` to `pdae`, add `scheme: "pdae"`, `userInterfaceStyle: "automatic"`, `plugins: ["expo-router", "expo-font"]`, `android.package: "com.pdae.app"`, `web: { "bundler": "metro", "output": "single", "favicon": "./assets/favicon.png" }`. Repo/package identifiers stay `PDAE`; only the user-facing name is Hodlo.

`babel.config.js`: use `babel-preset-expo`. `metro.config.js`: use `expo/metro-config` and add `glb`, `gltf` to `resolver.assetExts` (reserved for the post-v1 3D assets; there is no SVG transformer in v1). `tsconfig.json`: extend `expo/tsconfig.base`, set `strict: true`, add `"paths": { "@/*": ["./src/*"] }`.

`.env.example`:

```
EXPO_PUBLIC_API_URL=http://localhost:5215
EXPO_PUBLIC_API_MODE=mock
EXPO_PUBLIC_APP_ENV=development
```

`.gitignore`: add `.env*.local`, `dist/`, `.expo/`, `web-build/`, `playwright-report/`, `test-results/`.

- [ ] **Step 4: Create the router shell and move the health screen**

`app/_layout.tsx` renders `<Stack screenOptions={{ headerShown: false }} />`. `app/index.tsx` renders a minimal splash with the “Hodlo” wordmark and an `ActivityIndicator` (Task 8 replaces this with the session/onboarding redirect). Move the existing health UI from `App.tsx` to `app/dev/health.tsx`; import `getHealth` from `@/api/client`; redirect to `/` when `!__DEV__`. Delete `index.js` and `App.tsx` after the move.

- [ ] **Step 5: Verify the build and typecheck**

```bash
npm run typecheck
npx expo export -p web
npx expo start --web
```

Expected: typecheck clean; export writes `dist/`; the browser shows the onboarding placeholder with no red screen.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: make the app universal with Expo SDK 58 and Expo Router"
```

---

## Task 2: Test and CI foundation

**Files:**
- Modify: `package.json`, `jest.config.js`
- Delete: `.eslintrc.js`
- Create: `eslint.config.js`, `jest.setup.ts`, `__tests__/smoke.test.tsx`, `playwright.config.ts`, `e2e/web/smoke.spec.ts`, `maestro/smoke.yaml`, `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: Task 1's Expo app.
- Produces: `npm test`, `npm run test:e2e`, `npm run lint`, `npm run typecheck`, `npm run build:web`; CI runs all of them.

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D jest-expo @testing-library/react-native @playwright/test \
  eslint@^9 eslint-config-expo eslint-plugin-react-native-a11y prettier
npm uninstall @react-native/eslint-config @react-native/jest-preset @react-native/new-app-screen
rm .eslintrc.js
npx playwright install --with-deps chromium
```

ESLint 9 is required by `eslint-config-expo/flat`; keeping the legacy `.eslintrc.js` next to a flat config is the reason lint would otherwise disagree with CI. Keep `react-test-renderer` and `@types/react-test-renderer` — RNTL depends on them.

- [ ] **Step 2: Write the failing smoke test**

`__tests__/smoke.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

it('renders a themed label', () => {
  render(<Text>Hodlo</Text>);
  expect(screen.getByText('Hodlo')).toBeOnTheScreen();
});
```

Run `npm test` → expected FAIL: `jest-expo` preset/config not ready.

- [ ] **Step 3: Configure Jest and ESLint**

`jest.config.js`:

```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-router|@expo-google-fonts/.*|react-native-svg|@tanstack/.*|zustand))',
  ],
};
```

`jest.setup.ts`: mock `expo-font`, `expo-splash-screen`, `expo-haptics`, `expo-crypto` (`randomUUID: () => 'test-uuid'`), `@react-native-community/netinfo`, and `react-native-reanimated` using its Jest setup. Clear AsyncStorage in `beforeEach`.

`eslint.config.js`:

```js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([expoConfig, { ignores: ['dist/*', 'coverage/*'] }]);
```

- [ ] **Step 4: Configure Playwright and the CI workflow**

`playwright.config.ts`: `testDir: './e2e/web'`, `use: { baseURL: 'http://127.0.0.1:4173' }`, `webServer: { command: 'npm run e2e:serve', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 180_000 }`.

Add `"e2e:serve": "EXPO_PUBLIC_API_MODE=mock npm run build:web && npx serve dist -s -l 4173"` to scripts and `serve` as a dev dependency.

`e2e/web/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('loads the app shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Hodlo')).toBeVisible();
});
```

`.github/workflows/ci.yml`: trigger on `pull_request`; Node 22.13; `npm ci`; `npm run lint`; `npm run typecheck`; `npm test -- --ci`; `npm run build:web`; separate Playwright job with browser cache and `npm run test:e2e`. Upload `dist/` and `playwright-report/` artifacts.

- [ ] **Step 5: Run the suite**

```bash
npm test
npm run lint
npm run typecheck
npm run build:web
npm run test:e2e
```

Expected: all pass; smoke E2E sees the app title.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: add Jest, Playwright, and CI foundation"
```

---

## Task 3: Design tokens, theme, fonts, and settings

**Files:**
- Create: `src/theme/tokens.ts`, `src/theme/themes.ts`, `src/theme/ThemeProvider.tsx`, `src/theme/useTheme.ts`, `src/theme/useBreakpoint.ts`, `src/theme/useReducedMotion.ts`, `src/theme/contrast.ts`, `src/theme/fonts.ts`, `src/stores/settingsStore.ts`, `src/services/feedback.ts`
- Create tests: `src/theme/__tests__/tokens.test.ts`, `src/theme/__tests__/contrast.test.ts`, `src/theme/__tests__/theme.test.tsx`, `src/theme/__tests__/breakpoints.test.ts`

**Interfaces:**
- Produces:
  - `type ThemeMode = 'system' | 'light' | 'dark'`
  - `interface Theme { colors: ColorTokens; spacing: SpacingTokens; radii: RadiusTokens; typography: TypographyTokens; motion: MotionTokens; breakpoints: Breakpoints }`
  - `useTheme(): Theme & { mode: 'light' | 'dark'; setMode(mode: ThemeMode): void }`
  - `useBreakpoint(): { isMobile: boolean; isTablet: boolean; isDesktop: boolean; width: number }`
  - `useReducedMotion(): boolean`
  - `useSettingsStore` with `themeMode`, `reducedMotion`, `soundEnabled`, `hapticsEnabled`, `fontMode`, `notificationsEnabled`, `notificationFrequency`, `notificationsPausedUntil`, `setSetting`
  - `useAppFonts(): { loaded: boolean; error: Error | null }`
  - `feedback.correct()`, `feedback.wrong()`, `feedback.complete()`, `feedback.tap()` (haptics; respects settings)

- [ ] **Step 1: Write failing token and contrast tests**

`tokens.test.ts` asserts the exact palette, ledge shades, spacing scale, radii, type sizes, motion durations, and breakpoints from Global Constraints. `contrast.test.ts` asserts `meetsAA('#1E1538', '#F5F2FF')`, `meetsAA('#FFFFFF', '#6C4CF1')`, `meetsAA('#1E1538', '#3DDB80')`, `meetsAA('#1E1538', '#FFD84D')`, `meetsAA('#1E1538', '#FF5A6E')`, `meetsAA('#1E1538', '#B9A8FF')`, and `meetsAA('#6B6185', '#F5F2FF')` are true, and `meetsAA('#FFFFFF', '#FF5A6E')` is false.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- tokens` → expected FAIL: modules missing.

- [ ] **Step 3: Implement tokens, themes, and providers**

`tokens.ts` exports `lightColors`, `darkColors`, `ledgeColors`, `spacing`, `radii`, `typography`, `motion`, `breakpoints`. `themes.ts` exports `lightTheme` and `darkTheme`. `ThemeProvider` reads `useSettingsStore` + `useColorScheme`, provides the resolved theme, and exposes `setMode`. `useBreakpoint` uses `useWindowDimensions()` with the exact breakpoints. `useReducedMotion` returns true when the OS setting or `settings.reducedMotion` is true; on web, also read `window.matchMedia('(prefers-reduced-motion: reduce)')` behind a `typeof window !== 'undefined'` guard. `fonts.ts` loads Nunito 400/600/700/800/900 with `useFonts` from `@expo-google-fonts/nunito`.

`settingsStore.ts` uses Zustand `persist` + AsyncStorage with key `hodlo:v1:settings`; expose `hydrated` and `hydrate()`. Defaults: `themeMode: 'system'`, `reducedMotion: false`, `soundEnabled: false`, `hapticsEnabled: true`, `fontMode: 'nunito'`, `notificationsEnabled: false`, `notificationFrequency: 'daily'`, `notificationsPausedUntil: null`. This is the complete settings schema; later tasks change behavior and UI, not the field set.

`feedback.ts` maps correct/wrong/complete/tap to `expo-haptics` (`notificationAsync`/`impactAsync`) when `hapticsEnabled`; sound is a no-op until audio assets exist. On web, haptics are a no-op.

- [ ] **Step 4: Run tests to verify they pass**

`npm test -- tokens` and `npm test -- contrast` → PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add design tokens, themes, fonts, settings, and feedback service"
```

## Task 4: UI primitives, icons, and mascot slot

**Files:**
- Create: `src/components/ui/Button.tsx`, `Card.tsx`, `ProgressBar.tsx`, `ProgressRing.tsx`, `Badge.tsx`, `Chip.tsx`, `Icon.tsx`, `Sheet.tsx`, `EmptyState.tsx`, `OfflineBanner.tsx`, `PageHeader.tsx`, `Skeleton.tsx`, `index.ts`
- Create: `src/components/mascot/types.ts`, `Mascot.tsx`, `MascotPlaceholder.tsx`
- Create: `src/types/domain.ts`, `src/assets/icons/index.ts`, `src/assets/icons/*.tsx`
- Icons are authored in-repo as small `react-native-svg` components: one rounded, stroke-based component per `IconName`. Do not depend on an external asset folder, an icon site, or a downloaded pack — the repo has no such assets and the plan must be runnable from a clean clone.
- Create tests: `src/components/ui/__tests__/button.test.tsx`, `progress.test.tsx`, `page-header.test.tsx`, `icon.test.tsx`, `src/components/mascot/__tests__/mascot.test.tsx`

**Interfaces:**
- Consumes: `useTheme`, `useReducedMotion`, `feedback` (Task 3).
- Produces:
  - `type IconName = 'learn' | 'practice' | 'leagues' | 'quests' | 'profile' | 'settings' | 'fire' | 'bolt' | 'gem' | 'heart' | 'shield' | 'freeze' | 'lock' | 'check' | 'chest' | 'crown' | 'star' | 'chart' | 'wallet' | 'key' | 'search' | 'book' | 'shop' | 'play' | 'arrow-left' | 'arrow-right' | 'close' | 'more'`
  - `interface ButtonProps { label: string; onPress(): void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; disabled?: boolean; loading?: boolean; icon?: IconName; fullWidth?: boolean; testID?: string }`
  - `interface CardProps { children: ReactNode; onPress?(): void; padded?: boolean; tone?: 'default' | 'accent' | 'danger' }`
  - `interface ProgressBarProps { value: number; max?: number; tone?: 'purple' | 'mint' | 'yellow' | 'coral'; label?: string }`
  - `interface ProgressRingProps { value: number; size?: number; strokeWidth?: number; tone?: 'purple' | 'mint' | 'yellow'; label?: string }`
  - `interface PageHeaderProps { title: string; tier?: 'compact' | 'standard' | 'hero'; onBack?(): void; right?: ReactNode; artwork?: ReactNode }`
  - `interface OfflineBannerProps { state?: 'offline' | 'syncing' | 'error' | 'paused_auth'; pending?: number; onRetry?(): void }`
  - `type CharacterId = 'hodlo' | 'chip' | 'tank' | 'grizz' | 'vex'`
  - `type MascotMood = 'idle' | 'happy' | 'celebrate' | 'think' | 'sad' | 'shock' | 'sleep'`
  - `interface MascotProps { character: CharacterId; mood: MascotMood; intensity?: number; onPress?(): void; size?: 'sm' | 'md' | 'lg' }`
  - `CHARACTERS: Record<CharacterId, { name: string; catchphrase: string; color: string; accent: string }>`

- [ ] **Step 1: Write failing primitive tests**

Cover: Button renders label, fires `onPress`, does not fire when disabled/loading, exposes `accessibilityRole="button"` and `accessibilityState`; ProgressBar clamps `value` to `[0, max]` and exposes `accessibilityRole="progressbar"`; ProgressRing renders an SVG and label; PageHeader renders the same title container offset for all three tiers; Icon renders an SVG for every `IconName`, accepts `color`/`size`, and warns once (dev only) on an unknown name; Mascot renders the character name/catchphrase, fires `onPress`, and respects reduced motion.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- src/components/ui` → expected FAIL: modules missing.

- [ ] **Step 3: Implement the primitives**

No SVG transformer or icon-font dependency is needed: `react-native-svg` is already installed in Task 1, and each icon is a typed component in `src/assets/icons/` (`icon-<name>.tsx`). Metro only needs the `glb`/`gltf` asset extensions from Task 1 for the future 3D assets.

Implement `Button` with `Pressable`, `accessibilityRole="button"`, `accessibilityState={{ disabled, busy: loading }}`, a 4 px bottom ledge (a darker `View` under the surface), and a Reanimated press offset that is skipped when reduced motion is on. Variants: primary Purple/white, secondary Lilac/Plum, ghost transparent/Purple, danger Coral/Plum. Sizes: 44/48/56 height.

Implement `PageHeader` with fixed tier heights: compact 56, standard 88, hero 160; title container always starts at 16 px from the bottom of the header, so the title's vertical position is consistent. Hero accepts `artwork`.

Implement `Icon` with a registry mapping every `IconName` to its component; the registry is typed as `Record<IconName, ComponentType<IconProps>>`, so a missing icon is a compile error rather than a runtime fallback. Draw each icon on a 24×24 viewBox with `strokeLinecap="round"` and `strokeLinejoin="round"`; pass `color` (default `currentColor` via the theme) and `size` (default 24). Unknown names in untyped call sites log once in dev and render a neutral rounded dot.

Implement `Mascot` as `MascotPlaceholder`: a rounded tile with the character color, initial, name, and catchphrase; `size` maps to 64/120/200 px; `onPress` makes it a button; `intensity` is accepted but unused until 3D. Add `accessibilityLabel={`${name}, ${mood}`}`. `CHARACTERS` uses the palette (Hodlo Purple/Lilac, Chip Mint/Coral, Tank Mint/Purple, Grizz Purple/Coral, Vex Fox/cream).

- [ ] **Step 4: Run tests to verify they pass**

`npm test -- src/components/ui` and `npm test -- src/components/mascot` → PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add UI primitives, icon registry, and mascot slot"
```

---

## Task 5: Responsive app shell and navigation

**Files:**
- Create: `src/app/AppProviders.tsx`, `src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `BottomTabs.tsx`, `ContentColumn.tsx`, `src/navigation/tabs.ts`
- Create: `app/(tabs)/_layout.tsx`, `app/(tabs)/learn.tsx`, `practice.tsx`, `leagues.tsx`, `profile.tsx`, `app/+not-found.tsx`
- Modify: `app/_layout.tsx`, `app/index.tsx`
- Create tests: `src/components/layout/__tests__/app-shell.test.tsx`, `src/navigation/__tests__/tabs.test.ts`

**Interfaces:**
- Consumes: `useTheme`, `useBreakpoint`, `PageHeader`, `EmptyState`, `Icon`.
- Produces:
  - `AppProviders` wrapping `GestureHandlerRootView` → `SafeAreaProvider` → `ThemeProvider` (later tasks add API/sync/auth providers inside).
  - `AppShell({ children })` with bottom tabs at mobile, icon rail at tablet, sidebar at desktop.
  - `TABS: Array<{ key: 'learn' | 'practice' | 'leagues' | 'profile'; label: string; icon: IconName; href: string }>`.
  - Placeholder screens for `/learn`, `/practice`, `/leagues`, `/profile`.

- [ ] **Step 1: Write failing responsive tests**

`app-shell.test.tsx`: mock `useWindowDimensions` at widths 375, 900, 1280. Assert: 375 renders the bottom tabs and no sidebar; 900 renders the icon rail and no sidebar; 1280 renders the sidebar and no bottom tabs or icon rail. Assert the active tab gets `accessibilityState={{ selected: true }}` and pressing a tab calls `router.replace` with its href. `tabs.test.ts`: every tab has a unique key/href and a valid icon name.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- app-shell` → expected FAIL: modules missing.

- [ ] **Step 3: Implement the shell and routes**

`AppProviders` composes the providers listed above. `AppShell` renders:

- mobile: `<View flex=1>{children}</View><BottomTabs />`
- tablet: `<IconRail /><View flex=1>{children}</View>`
- desktop: `<Sidebar /><ContentColumn>{children}</ContentColumn>`

`ContentColumn` caps width at 600 px and centers it with 24 px horizontal padding; add a `maxWidth` prop for lessons (720). There is no right rail.

`BottomTabs` uses `usePathname()` and `router.replace(tab.href)`. Each tab is a `Pressable` with `accessibilityRole="tab"`, `accessibilityState={{ selected }}`, and a 44×44 target. `Sidebar` uses the same `TABS` with labels. `IconRail` uses icons with tooltips/`accessibilityLabel`.

`app/(tabs)/_layout.tsx` returns `<AppShell><Slot /></AppShell>`. Each tab screen renders `<PageHeader title="..." tier="standard" />` plus an `EmptyState` placeholder. `+not-found.tsx` renders an `EmptyState` with a “Go to Learn” button.

`app/_layout.tsx` wraps `<Stack>` in `AppProviders`. Call `SplashScreen.preventAutoHideAsync()` at module scope and use `useAppFonts()`; keep the splash visible until fonts load, then hide it. On font error, log and continue with system fonts rather than blocking the app. `app/index.tsx` redirects to `/learn` until Task 8 replaces it with the session/onboarding guard, so the app is navigable before onboarding exists.

- [ ] **Step 4: Run tests and verify web routing**

```bash
npm test -- app-shell
npm run typecheck
npx expo start --web
```

Expected: tests pass; resizing the browser swaps bottom tabs → rail → sidebar; `/learn` is reachable directly.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add responsive app shell and tab navigation"
```

---

## Task 6: Typed API contract, mock adapter, and content schema

**Files:**
- Create: `src/api/contracts.ts`, `errors.ts`, `config.ts`, `http.ts`, `mock.ts`, `fixtures.ts`, `queryClient.ts`, `ApiProvider.tsx`, `health.ts`, `index.ts`
- Create: `src/content/schema.ts`, `src/content/packs/hodlo-pack-v1.json`, `src/content/fixtures/pack.ts`
- Create: `docs/api-contract.md`
- Modify: `src/app/AppProviders.tsx`, `app/dev/health.tsx` (import `getHealth` from `@/api/health`)
- Delete: `src/api/client.ts` after moving `getHealth`
- Create tests: `src/api/__tests__/http.test.ts`, `mock.test.ts`, `contracts.test.ts`, `src/content/__tests__/schema.test.ts`

**Interfaces:**
- Consumes: Task 1's `getHealth` (move it to `src/api/health.ts` and keep `/dev/health` working).
- Produces:
  - Zod schemas + inferred types: `UserProfile`, `UpdateProfileInput`, `StreakState`, `LearningModule`, `LessonSummary`, `LessonProgress`, `Lesson`, `OfflineLesson`, `OfflinePack`, `Exercise` (10 variants), `Answer` (10 variants), `AnswerKey`, `SubmittedAnswer`, `SubmitAttemptInput`, `AttemptResult`, `Achievement`, `Leaderboard`, `Portfolio`, `Holding`, `Quote`, `Trade`, `PlaceTradeInput`, `ProblemDetails`.
  - `interface ApiClient` with `auth`, `profile`, `content`, `progress`, `attempts`, `leaderboard`, `achievements`, `trading` namespaces (methods below).
  - `class ApiError extends Error { status: number; code?: string; details?: unknown }`
  - `createApiClient(): { client: ApiClient; mode: 'mock' | 'http' }`
  - `useApi(): { client: ApiClient; mode: 'mock' | 'http' }`
  - `queryClient` with `networkMode: 'offlineFirst'`, `staleTime: 30_000`, retry only network errors and 5xx responses (never 4xx), persisted under `hodlo:v1:query-cache`.

- [ ] **Step 1: Write failing contract tests**

`contracts.test.ts`: parse `mockPack` with `offlinePackSchema`; assert 5 modules, 2 lessons per module, at least one exercise of each of the 10 types, and every lesson has an `answerKey` entry for every exercise. Parse a `Lesson` after stripping `answerKey`; assert no `answerKey` field survives. `http.test.ts`: a 401 maps to `ApiError.status === 401`; a 500 is retryable; a network failure maps to `ApiError` with `status === 0`; a malformed JSON body throws a validation error. `mock.test.ts`: `getLesson` returns no answer key; `submitAttempt` is idempotent by `clientAttemptId`; `login` returns `mockUser`; `profile.update` merges fields and returns the updated user; `profile.deleteAccount` rejects with a 501 `ApiError` (the backend does not support deletion yet); `placeTrade` rejects a negative quantity.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- src/api` → expected FAIL: modules missing.

- [ ] **Step 3: Implement the contract and mock**

`contracts.ts` uses Zod discriminated unions. Key shapes:

```ts
type CharacterId = 'hodlo' | 'chip' | 'tank' | 'grizz' | 'vex';

interface UserProfile {
  id: string; email: string; displayName: string; characterId: CharacterId;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[]; dailyGoalXp: number; xp: number; gems: number;
  hearts: number; maxHearts: number; timezone: string; streak: StreakState;
  onboardingCompleted: boolean; createdAt: string;
}

interface UpdateProfileInput {
  displayName?: string; characterId?: CharacterId;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[]; dailyGoalXp?: number; timezone?: string;
  onboardingCompleted?: boolean;
}

interface StreakState {
  current: number; longest: number; lastLessonDate: string | null;
  freezesEquipped: number; restDay: number | null;
}

interface LearningModule {
  id: string; slug: string; title: string; description: string; order: number;
  unitNumber: number; teacherCharacterId: CharacterId;
  accent: 'purple' | 'mint' | 'coral' | 'yellow' | 'lilac'; lessonCount: number;
}

interface LessonSummary {
  id: string; moduleId: string; title: string; description: string; order: number;
  kind: 'lesson' | 'chest' | 'character_intro'; xpReward: number;
  estimatedMinutes: number; status: 'locked' | 'available' | 'in_progress' | 'completed';
  bestScore?: number;
}

interface LessonProgress {
  lessonId: string; status: 'locked' | 'available' | 'in_progress' | 'completed';
  bestScore?: number; attempts: number;
}

interface Lesson extends LessonSummary { exercises: Exercise[] }
interface OfflineLesson extends Lesson { answerKey: Record<string, Answer> }
interface OfflinePack { version: string; generatedAt: string; modules: LearningModule[]; lessons: OfflineLesson[] }

interface AttemptResult {
  attemptId: string; clientAttemptId: string; lessonId: string;
  score: number; passed: boolean; xpEarned: number; hearts: number;
  streak: StreakState; levelUp?: { level: number; title: string };
  newAchievements: Achievement[];
}

interface Achievement {
  id: string; title: string; description: string; icon: string;
  earnedAt: string | null; progress: number; target: number;
}

interface LeaderboardEntry {
  userId: string; displayName: string; xp: number; rank: number;
  tier: 'bronze' | 'silver' | 'gold' | 'amethyst' | 'diamond';
}

interface Leaderboard {
  tier: LeaderboardEntry['tier']; endsAt: string; currentUserId: string;
  promotionZone: number; demotionZone: number; entries: LeaderboardEntry[];
}

interface Holding {
  symbol: string; quantity: number; averageCost: number;
  currentPrice: number; value: number; pnl: number;
}

interface Portfolio {
  cash: number; totalValue: number; totalPnl: number;
  holdings: Holding[]; updatedAt: string;
}

interface Quote { symbol: string; price: number; change24h: number; updatedAt: string }

interface Trade {
  id: string; symbol: string; side: 'buy' | 'sell';
  quantity: number; price: number; executedAt: string;
}
```

Exercise variants (all have `id`, `prompt`, optional `explanation`):
`multiple_choice` (`options: { id, text }[]`), `true_false` (`statement`), `fill_blank` (`parts: string[]`, `blankCount`), `match_pairs` (`left`, `right`), `order_steps` (`steps: { id, text }[]`), `read_chart` (`candles: { open, high, low, close }[]`, `options`), `spot_scam` (`artifact: { kind: 'dm' | 'email' | 'token_page'; title: string; body: string }`, `hotspots: { id, label, text }[]`), `risk_calculator` (`balance`, `riskPercent`, `entry`, `stop`), `dca_timeline` (`prices: number[]`, `options: ('buy' | 'hold' | 'sell')[]`), `story_card` (`body`, `options`).

Answer variants mirror the exercise type: `optionId`, `value: boolean`, `values: string[]`, `pairs`, `stepIds`, `hotspotIds`, `positionSize`, `action`, `optionId`.

`ApiClient` methods:

```ts
interface ApiClient {
  auth: { register(input: RegisterInput): Promise<UserProfile>;
          login(input: LoginInput): Promise<UserProfile>;
          logout(): Promise<void>; me(): Promise<UserProfile>; };
  profile: { update(input: UpdateProfileInput): Promise<UserProfile>;
             deleteAccount(): Promise<void>; };
  content: { listModules(): Promise<LearningModule[]>;
             listLessons(moduleId: string): Promise<LessonSummary[]>;
             getLesson(lessonId: string): Promise<Lesson>;
             getOfflinePack(version?: string): Promise<OfflinePack>; };
  progress: { getProgress(): Promise<LessonProgress[]>; };
  attempts: { submit(input: SubmitAttemptInput, clientAttemptId: string): Promise<AttemptResult>; };
  leaderboard: { getWeekly(): Promise<Leaderboard>; };
  achievements: { list(): Promise<Achievement[]>; };
  trading: { getPortfolio(): Promise<Portfolio>;
             getQuotes(symbols: string[]): Promise<Quote[]>;
             placeTrade(input: PlaceTradeInput, clientTradeId: string): Promise<Trade>; };
}
```

`http.ts` uses `fetch` with `credentials: 'include'`, `Content-Type: application/json`, `X-Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone`, an `AbortController` timeout of 15 s, and `Idempotency-Key` on attempts/trades. Parse every response with the matching Zod schema. Map `ProblemDetails` to `ApiError`; map network/abort to `ApiError` status 0.

`mock.ts` implements the same interface against `fixtures.ts` and the bundled pack. Keep a `currentUser` (null until login/register), an in-memory `attemptsByClientId` map so duplicate submissions return the original `AttemptResult`, and a `tradesByClientId` map. `me` returns `currentUser` or rejects with a 401 `ApiError`; `logout` clears it. `resetMockApi()` clears all state for tests. Latency is 0 in tests and 150 ms in dev.

`fixtures.ts` exports `mockUser` (starts with `onboardingCompleted: false`; `profile.update` merges into it and `profile.deleteAccount` rejects with a 501 `ApiError`), `mockLeaderboard` (30 entries), `mockAchievements` (12), `mockPortfolio`, `mockQuotes`, `mockTrades`. The content pack fixture lives in `src/content/packs/hodlo-pack-v1.json`; `src/content/fixtures/pack.ts` re-exports it as a typed object. Use 5 modules (Foundations/Hodlo, Price Action/Chip, Investing/Tank, Risk/Grizz, Stay Safe/Vex), 2 lessons each, 4 exercises each, covering all 10 exercise types. Fixtures use 4 exercises for test speed; production packs must contain 8–12 prompts per lesson. This is fixture content, not production copy.

`ApiProvider` wraps children in `PersistQueryClientProvider` and provides `{ client, mode }`; `useApi` throws outside the provider. Add `ApiProvider` inside `ThemeProvider` in `AppProviders`.

- [ ] **Step 4: Write `docs/api-contract.md`**

Include the endpoint table, request/response fields, cookie/CORS rules, ProblemDetails shape, idempotency requirements, timezone header, and the **NEW** offline additions (`GET /content/pack`, `GET /users/me/progress`, `Idempotency-Key` on attempts/trades, optional `DELETE /users/me`). Add a “backend handshake checklist” with checkboxes for CORS credentials, cookie attributes, answer-key omission from online lessons, server re-scoring, and duplicate handling.

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- src/api
npm test -- src/content
npm run typecheck
```

Expected: PASS; the mock adapter serves the pack; no answer key appears in `getLesson`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add typed API contract, mock adapter, and content schema"
```

---

## Task 7: Offline content, progress, outbox, and sync

**Files:**
- Create: `src/offline/storage.ts`, `outbox.ts`, `sync.ts`, `syncStatusStore.ts`, `useSyncStatus.ts`, `SyncProvider.tsx`, `src/content/repository.ts`, `src/content/ContentProvider.tsx`, `src/stores/progressStore.ts`
- Modify: `src/app/AppProviders.tsx`
- Create tests: `src/offline/__tests__/outbox.test.ts`, `sync.test.ts`, `src/content/__tests__/repository.test.ts`, `src/stores/__tests__/progress-store.test.ts`, `src/offline/__tests__/offline-lesson.test.ts`

**Interfaces:**
- Consumes: `ApiClient`, `OfflinePack`, `OfflineLesson`, `AttemptResult` (Task 6); AsyncStorage.
- Produces:
  - `interface KeyValueStorage { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void>; removeItem(key: string): Promise<void> }`
  - `class Outbox { enqueue(item: PendingAttempt): Promise<void>; list(): Promise<PendingAttempt[]>; remove(clientAttemptId: string): Promise<void>; markFailed(clientAttemptId: string, error: string): Promise<void>; markRetry(clientAttemptId: string, error: string, nextRetryAt: number): Promise<void> }`
  - `interface PendingAttempt { clientAttemptId: string; lessonId: string; localResult: LocalAttemptResult; retries: number; lastError?: string; nextRetryAt?: number }`
  - `interface LocalAttemptResult { clientAttemptId: string; lessonId: string; startedAt: string; completedAt: string; answers: SubmittedAnswer[]; score: number; passed: boolean; xpEarned: number; heartsLost: number; mistakes: string[] }`
  - `interface LocalLessonProgress { lessonId: string; status: 'in_progress' | 'completed'; bestScore?: number; attempts: number; lastAttemptAt?: string }`
  - `interface SubmittedAnswer { exerciseId: string; answer: Answer; correct: boolean }`
  - `class ContentRepository { getPack(): Promise<OfflinePack>; refresh(): Promise<OfflinePack>; getModules(): Promise<LearningModule[]>; getLessonSummaries(moduleId: string): Promise<LessonSummary[]>; getLesson(lessonId: string): Promise<OfflineLesson>; registerSynthetic(lesson: OfflineLesson): void }`
  - `class ProgressRepository { get(userId: string): Promise<Record<string, LocalLessonProgress>>; save(userId: string, progress: Record<string, LocalLessonProgress>): Promise<void>; clear(userId: string): Promise<void> }`
  - `class SyncEngine { flush(): Promise<SyncStatus>; getStatus(): SyncStatus; subscribe(listener: (s: SyncStatus) => void): () => void }`
  - `type SyncState = 'idle' | 'syncing' | 'offline' | 'paused_auth' | 'error'`
  - `interface SyncStatus { state: SyncState; pending: number; lastSyncedAt: string | null; lastError?: string }`
  - `useSyncStatus(): SyncStatus`
  - `useSync(): { enqueue(item: PendingAttempt): Promise<void>; flush(): Promise<SyncStatus> }` — provided by `SyncProvider`.
  - `useContent(): ContentRepository` — provided by `ContentProvider`; one repository per app session.
  - `useProgressStore` with `userId`, `lessons`, `pendingXp`, `pendingXpByAttempt`, `lastResult`, `setUser`, `hydrate`, `applyLocalResult`, `clear`.

- [ ] **Step 1: Write failing offline tests**

`outbox.test.ts`: enqueue/list/remove persists across a new `Outbox` instance using the same fake storage; order is FIFO; markRetry preserves the item with `nextRetryAt`; markFailed keeps it for manual retry. `sync.test.ts`: a successful flush calls `submit` once, removes the item, and updates progress; a duplicate `clientAttemptId` from the mock returns the same result and applies XP once; a 401 sets `paused_auth` and keeps the item; a 500 increments retries and sets a future `nextRetryAt`; offline sets `offline` and does not call the API. `repository.test.ts`: bundled pack loads and validates; `refresh` saves a newer pack; a corrupt cached pack falls back to bundled. `progress-store.test.ts`: `applyLocalResult` marks the lesson completed, stores the best score, and adds `pendingXp`; `clear` removes user data but not the content pack. `offline-lesson.test.ts`: with `isOnline = false`, complete a lesson → result is in the outbox; reconnect and flush → progress is synced and the outbox is empty.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- src/offline` → expected FAIL: modules missing.

- [ ] **Step 3: Implement storage, outbox, and sync**

`storage.ts` wraps AsyncStorage with JSON helpers and namespaced keys: `hodlo:v1:content-pack`, `hodlo:v1:progress:<userId>`, `hodlo:v1:outbox:<userId>`, `hodlo:v1:lesson-session`, `hodlo:v1:settings`, `hodlo:v1:query-cache`. `clearUserData(userId)` removes progress, outbox, lesson session, and the persisted query cache; it never removes the content pack or settings.

`Outbox` persists `PendingAttempt[]` under the user-scoped key. Use `expo-crypto.randomUUID()` for ids. `SyncEngine` dependencies are injected (`api`, `outbox`, `onResult`, `now`, `isOnline`) so tests use fakes. `flush()`:

1. If offline → `offline`.
2. For each due item in FIFO order: call `api.attempts.submit(item.localResult, item.clientAttemptId)`.
3. On success: `await onResult(result)`, remove the item, update `lastSyncedAt`.
4. On `ApiError.status === 401`: `paused_auth`, stop.
5. On `status === 0` or `>= 500`: increment retries, set `nextRetryAt = now + min(2^retries * 5s, 5min)`, continue.
6. On other 4xx: `markFailed`, continue.
7. Finish with `idle` (or `error` if any failed).

`SyncProvider` reads `userId` from `useProgressStore`; when it is `null` (before sign-in) it reports `idle` with zero pending and does not flush. When `userId` becomes non-null (Task 8 calls `setUser`), it constructs the user-scoped `Outbox`, flushes immediately, and starts listeners on mount: NetInfo `isInternetReachable === true` → `flush()`; AppState `active` → `flush()`. It also flushes once on mount. Clean up on unmount. Expose status through `syncStatusStore` + `useSyncStatus`, and expose the enqueue/flush functions through `useSync` so the lesson engine never talks to the outbox directly. `OfflineBanner` shows `pending` with a Retry action calling `flush()`; when the state is `paused_auth`, the action is “Sign in to sync” and routes to `/login`.

- [ ] **Step 4: Implement content and progress repositories**

`ContentRepository` imports the bundled JSON via `require('@/content/packs/hodlo-pack-v1.json')`, validates it with `offlinePackSchema`, and caches it in AsyncStorage. `getPack` returns cached (if valid) or bundled; `refresh` calls `api.content.getOfflinePack(currentVersion)`, validates, and saves if `version` differs. `getLesson` returns the `OfflineLesson` including `answerKey`. `getModules`/`getLessonSummaries` derive from the pack. `registerSynthetic` stores a lesson in an in-memory map (used by the mistakes review); `getLesson` checks that map before the pack. Synthetic lessons are not persisted and disappear on reload — the practice screen rebuilds them.

`ContentProvider` creates one repository from the current `ApiClient` and exposes it through `useContent`; add it to `AppProviders` inside `ApiProvider` and outside `SyncProvider`.

`ProgressRepository` reads/writes the user progress map. `progressStore` (Zustand) holds the in-memory copy:

```ts
interface ProgressState {
  userId: string | null;
  lessons: Record<string, LocalLessonProgress>;
  pendingXp: number;
  pendingXpByAttempt: Record<string, number>;
  lastResult: LocalAttemptResult | null;
  setUser(userId: string | null): Promise<void>;
  hydrate(): Promise<void>;
  applyLocalResult(result: LocalAttemptResult): Promise<void>;
  clear(): void;
}
```

`applyLocalResult` sets `status: 'completed'` when `passed`, keeps `bestScore = max(previous, score)`, increments `attempts`, stores `lastResult`, adds `xpEarned` to `pendingXp`, and records `pendingXpByAttempt[clientAttemptId] = xpEarned`. Task 13 adds daily XP/streak and server reconciliation.

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- src/offline
npm test -- src/content
npm test -- src/stores
```

Expected: PASS; the offline-lesson integration test proves queue → reconnect → sync once.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add offline content, progress store, outbox, and sync engine"
```

---

## Task 8: Authentication, session, and route guards

**Files:**
- Create: `src/auth/sessionStore.ts`, `AuthProvider.tsx`, `useSession.ts`, `validation.ts`, `rootRedirect.ts`, `src/stores/onboardingStore.ts`
- Create: `app/(auth)/_layout.tsx`, `login.tsx`, `register.tsx`
- Modify: `app/_layout.tsx`, `app/index.tsx`, `src/app/AppProviders.tsx`
- Create tests: `src/auth/__tests__/session-store.test.ts`, `auth-screens.test.tsx`, `root-redirect.test.tsx`

**Interfaces:**
- Consumes: `useApi`, `ApiError`, `useProgressStore`, `PageHeader`, `Button`.
- Produces:
  - `type SessionStatus = 'loading' | 'authenticated' | 'anonymous'`
  - `useSessionStore` with `status`, `user`, `lastValidatedAt`, `isOffline`, `returnTo`, `signIn(user)`, `updateUser(user)`, `signOut()`, `expireSession()`, `hydrate()`, `refresh()`, `setReturnTo(path)`, `consumeReturnTo()`.
  - `useSession(): { status; user; isOffline; updateUser(user): void; signOut(): Promise<void> }`
  - `AuthProvider` hydrates the cached session, refreshes `GET /users/me` when online, keeps a cached session when offline, and clears on 401.
  - `useRootRedirect()` implementing the rules below.
  - `useOnboardingStore` with `completed: boolean`, `markCompleted()`, `reset()`.

- [ ] **Step 1: Write failing auth tests**

`session-store.test.ts`: hydrate with a cached user → authenticated; hydrate with no cache → anonymous; refresh 401 → anonymous and clears; refresh network error with cache → authenticated + `isOffline` true; `setReturnTo`/`consumeReturnTo` returns the path once then null. `auth-screens.test.tsx`: empty email/password shows validation messages; invalid credentials shows the API message; successful login calls `signIn` and `router.replace(returnTo ?? '/(tabs)/learn')`; register validates password length and matching confirmation; “Start onboarding” navigates to `/onboarding`. `root-redirect.test.tsx`: anonymous outside auth/onboarding → `/onboarding` (fresh install) or `/login` with `returnTo` set (onboarding complete); authenticated with onboarding incomplete → `/onboarding`; authenticated + complete in auth → `/(tabs)/learn`; loading → no redirect.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- src/auth` → expected FAIL: modules missing.

- [ ] **Step 3: Implement the session store and provider**

Use Zustand `persist` with AsyncStorage key `hodlo:v1:session`. Persist only `{ user, lastValidatedAt }`; never passwords. `signIn` stores the user, sets `lastValidatedAt = now`, calls `useProgressStore.getState().setUser(user.id)`, and syncs the onboarding flag: `markCompleted()` when `user.onboardingCompleted` is true, otherwise `reset()`. `updateUser` replaces the cached profile without touching validation time; onboarding and profile editing call it after `api.profile.update`. `signOut` calls `api.auth.logout()` best-effort, clears the session, clears user progress/outbox via `useProgressStore.getState().clear()`, calls `queryClient.clear()` and removes the persisted query cache, and resets the local onboarding flag. A returning user gets it back from `user.onboardingCompleted` on the next sign-in, so one user's completion never leaks to another. It clears only user data.

`AuthProvider` on mount: `hydrate()`; if a cached user exists, call `api.auth.me()`; on success update; on 401 call `expireSession()` (clear only the session, keep progress/outbox/query cache so queued attempts survive); on network error keep the cached user and set `isOffline`. Re-check on AppState `active`.

`rootRedirect.ts` uses `useSegments()`, `usePathname()`, `useRouter()`, and the session/onboarding stores. Use `useEffect` + `router.replace`. Rules:

- `loading` → no redirect.
- anonymous and not in `(auth)` or `onboarding` → `/onboarding` if onboarding not completed, else `/login` after `setReturnTo(currentPath)`.
- authenticated and onboarding not completed and not in `onboarding` → `/onboarding`.
- authenticated + onboarding completed and in `(auth)` or `onboarding` → `/(tabs)/learn`.

`returnTo` is in-memory only (never persisted), so it cannot leak across users. Login and register call `consumeReturnTo()` after `signIn` and `router.replace(returnTo ?? '/(tabs)/learn')`.

`app/_layout.tsx` calls `useRootRedirect()` inside `AppProviders` + `AuthProvider`. `app/index.tsx` renders a splash (Hodlo wordmark + `ActivityIndicator`) while redirecting.

- [ ] **Step 4: Implement the auth screens**

Login: email + password, `react-hook-form` + Zod, show/hide password, inline errors, submit loading, API error banner, “Create account” link, “Start onboarding” link, and a “Demo mode” badge when `useApi().mode === 'mock'`. Register: display name, email, password, confirm password, terms checkbox (link to disclaimer), submit. On success, `signIn(user)` and route to `/onboarding` (Task 9 will continue the flow) or `/(tabs)/learn` if onboarding is already complete.

Both screens use `KeyboardAvoidingView`, safe-area padding, and a 600 px max-width card on web. All inputs have `accessibilityLabel`, `autoComplete`, and `textContentType`.

- [ ] **Step 5: Verify cookie persistence on Android**

Manual checklist (record the result in `docs/api-contract.md`): start the backend, run `npx expo run:android`, log in, force-stop the app, reopen → still authenticated; then log out → `GET /users/me` returns 401. If the cookie does not persist, add an `expo-secure-store` bearer-token fallback and coordinate the backend change before proceeding.

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm test -- src/auth
npm run typecheck
```

Expected: PASS; the login/register screens render on web and Android.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add cookie session, auth screens, and route guards"
```

## Task 9: Onboarding flow

**Files:**
- Create: `app/onboarding/_layout.tsx`, `index.tsx`, `level.tsx`, `interests.tsx`, `goal.tsx`, `cast.tsx`, `placement.tsx`, `account.tsx`, `notifications.tsx`
- Create: `src/features/onboarding/OnboardingStep.tsx`, `ChoiceCard.tsx`, `CastCard.tsx`, `placement.ts`
- Modify: `src/stores/onboardingStore.ts` (add `step`, `data`, `patchData`, `setStep`)
- Create tests: `src/features/onboarding/__tests__/onboarding-store.test.ts`, `onboarding-flow.test.tsx`, `placement.test.ts`

**Interfaces:**
- Consumes: `CHARACTERS`, `Mascot`, `useSessionStore`, `useApi`, `useOnboardingStore`, `PageHeader`, `Button`.
- Produces:
  - `interface OnboardingData { experienceLevel: 'beginner' | 'intermediate' | 'advanced'; interests: string[]; dailyGoalXp: number; characterId: CharacterId; placementScore: number | null }`
  - `useOnboardingStore` with `step`, `data`, `completed`, `setStep`, `patchData`, `markCompleted`, `reset`.
  - `ONBOARDING_STEPS: readonly ['welcome', 'level', 'interests', 'goal', 'cast', 'placement', 'account', 'notifications']`.
  - `gradePlacement(answers: Record<string, string>, pack: OfflinePack): number` returning 0–3.

- [ ] **Step 1: Write failing onboarding tests**

`onboarding-store.test.ts`: `patchData` merges; `setStep` persists; `markCompleted` survives a new store instance. `placement.test.ts`: 0/1/2/3 correct answers map to 0/33/66/100; an unknown exercise id is ignored. `onboarding-flow.test.tsx`: welcome → level requires a selection before Continue; goal requires a selection; cast renders all five characters and their catchphrases; placement can be skipped; account step shows an error when offline; successful register calls `api.profile.update` with the onboarding data and navigates to the first lesson; notification “Not now” sets `notificationsEnabled` false.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- onboarding` → expected FAIL: modules missing.

- [ ] **Step 3: Implement the step shell and data store**

`onboardingStore` persists under `hodlo:v1:onboarding` with `{ step, data, completed }`. `OnboardingStep` renders a `PageHeader` (compact), a progress indicator (`step + 1` of 8), a scrollable body, and a sticky footer with Back/Continue. Continue is disabled until the step's validation passes. All screens use a 600 px max-width column on web and safe-area padding on native.

Step content:

1. **Welcome:** Hodlo mascot, “Learn crypto without losing your shirt.”, Start button, “I already have an account” link.
2. **Level:** three `ChoiceCard`s (Just starting / I know the basics / I trade already).
3. **Interests:** multi-select chips (Basics, Trading, Safety, All of it); at least one required.
4. **Goal:** Casual 10 XP / Regular 30 XP / Serious 50 XP per day.
5. **Cast:** horizontal paged `FlatList` of five `CastCard`s using `CHARACTERS`; each shows name, role, catchphrase, `Mascot` placeholder; dots indicate page.
6. **Placement:** three multiple-choice questions from the first Foundations lesson; each answer is compared to the pack's `answerKey`; a Skip button records `placementScore: null`; the result sets `experienceLevel` (0–1 beginner, 2 intermediate, 3 advanced) unless the learner already chose a level.
7. **Account:** register (display name, email, password) or log in; on success call `api.profile.update` with `{ experienceLevel, interests, dailyGoalXp, characterId, timezone, onboardingCompleted: true }`, store the returned profile with `useSessionStore.getState().updateUser(updated)`, then `markCompleted()` and navigate to the first available lesson. If offline, show “Connect to create your account” with Retry; the onboarding data stays saved.
8. **Notifications:** explain the daily reminder and streak-saver; “Enable reminders” calls `setSetting('notificationsEnabled', true)` and a `requestNotificationPermission()` no-op (push delivery is v1.1); “Not now” sets false. Then finish to the first lesson.

The account step must prefill the email if the learner started from the login screen and returned. Use `router.replace` after completion so Back does not re-enter onboarding.

- [ ] **Step 4: Implement placement and first-lesson selection**

`placement.ts` exports `gradePlacement`. Select the first three `multiple_choice` exercises from the Foundations module's first lesson. If fewer than three exist, use all available. `firstAvailableLesson(pack, progress)` returns the first lesson whose status is `available`/`in_progress`, else the first lesson.

- [ ] **Step 5: Run tests and verify the flow on web**

```bash
npm test -- onboarding
npm run typecheck
npx expo start --web
```

Expected: tests pass; the full onboarding flow reaches the first lesson in mock mode; killing/reloading mid-flow resumes at the saved step.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add resumable onboarding flow"
```

---

## Task 10: Learn path

**Files:**
- Create: `app/(tabs)/learn.tsx` (replace placeholder), `src/features/learn/LearnScreen.tsx`, `useLearnPath.ts`, `selectors.ts`, `UnitBanner.tsx`, `PathNode.tsx`, `PathConnector.tsx`, `JumpToUnitSheet.tsx`, `LearnHeaderStats.tsx`
- Create tests: `src/features/learn/__tests__/selectors.test.ts`, `learn-screen.test.tsx`

**Interfaces:**
- Consumes: `useContent`, `useProgressStore`, `useSession`, `useSyncStatus`, `PageHeader`, `ProgressRing`, `Sheet`, `Mascot`.
- Produces:
  - `interface UnitSection { module: LearningModule; lessons: LessonSummary[]; completed: number; total: number }`
  - `selectLearnPath(pack: OfflinePack, progress: Record<string, LocalLessonProgress>): { units: UnitSection[]; nextLesson: LessonSummary | null; currentUnit: LearningModule | null }`
  - `selectNextLesson(pack, progress): LessonSummary | null`
  - `selectUnitProgress(lessons, progress): { completed: number; total: number }`
  - `useLearnPath()` returning the selector result plus `isLoading`, `error`, `refresh`.

- [ ] **Step 1: Write failing selector and screen tests**

`selectors.test.ts`: a fresh pack returns the first lesson of unit 1 as `nextLesson`; a completed first lesson returns the second; completing a unit returns the first lesson of the next unit; locked lessons stay locked when a previous lesson is incomplete; unit progress counts only `lesson` kind, not chests; all-complete returns `null`. `learn-screen.test.tsx`: renders the unit banner with the teacher name; renders locked/available/in-progress/completed nodes with the right accessibility labels; pressing a locked node does nothing; pressing an available node calls `router.push('/lesson/<id>')`; the progress ring shows the correct percentage; the offline banner appears when `useSyncStatus().state === 'offline'`; “Jump to unit” opens the sheet and calls `scrollToLocation`.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- src/features/learn` → expected FAIL: modules missing.

- [ ] **Step 3: Implement the selectors and path data**

`selectLearnPath` merges the pack's lesson summaries with local progress: local progress overrides server status; a lesson is `available` if the previous lesson in the same module is completed or it is the first lesson; `in_progress` if local status is in progress; `completed` if local passed. Keep server statuses as the fallback. Compute `nextLesson` as the first available/in-progress in module/lesson order. `currentUnit` is the module containing `nextLesson`, else the last module.

- [ ] **Step 4: Implement the Learn screen**

Use a `SectionList` with one section per unit and `stickySectionHeadersEnabled`. Header: `PageHeader tier="compact"` with the Hodlo wordmark and `LearnHeaderStats` (streak flame, gem, XP) on the right. `ListHeaderComponent`: the current unit's `UnitBanner` (hero artwork slot with `Mascot`, unit number/title, progress ring). Each `UnitBanner` is the section header; it includes “Jump to unit” on press.

`PathNode`:

- 72 px circle with a 4 px ledge; alternating left/right offset (`index % 2 === 0 ? -40 : 40`).
- `locked`: Plum/neutral fill, lock icon, disabled.
- `available`: Purple fill, play icon, accessible label “Lesson N, available”.
- `in_progress`: Purple fill with `ProgressRing` and “Lesson N, in progress”.
- `completed`: Mint fill with check, “Lesson N, completed”.
- Decorative chest after every fourth lesson: 56 px yellow tile with chest icon, `accessibilityState={{ disabled: true }}`, label “Chest, coming soon”. Do not award anything in v1.
- A vertical dashed `PathConnector` behind the nodes, using an absolutely positioned `View` or SVG line; it must not intercept touches.

`JumpToUnitSheet` lists units with completion counts and calls `sectionListRef.current?.scrollToLocation({ sectionIndex, itemIndex: 0 })`.

Offline: show `OfflineBanner` with “You're offline. Downloaded lessons still work.”; do not block the path. If the pack fails to load, show `EmptyState` with a Retry button.

- [ ] **Step 5: Run tests and verify responsive layout**

```bash
npm test -- src/features/learn
npm run typecheck
npx expo start --web
```

Expected: path renders on mobile/tablet/desktop; nodes alternate; sticky unit banner works; locked nodes are disabled; the next lesson opens the intro.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add the Learn path with unit sections and lesson nodes"
```

---

## Task 11: Lesson engine core, intro, and playable questions

**Files:**
- Create: `src/features/lesson/types.ts`, `engine.ts`, `useLessonSession.ts`, `components/QuestionHeader.tsx`, `ExerciseRenderer.tsx`, `MultipleChoice.tsx`, `TrueFalse.tsx`, `FillBlank.tsx`, `FeedbackSheet.tsx`, `HeartsOutModal.tsx`, `src/hooks/useKeyboardShortcuts.ts`
- Create: `app/lesson/[lessonId]/index.tsx`, `app/lesson/[lessonId]/play.tsx`
- Create tests: `src/features/lesson/__tests__/engine.test.ts`, `check-answer.test.ts`, `score-attempt.test.ts`, `lesson-session.test.tsx`, `src/hooks/__tests__/use-keyboard-shortcuts.test.ts`

**Interfaces:**
- Consumes: `useContent`, `useProgressStore`, `useSync`, `feedback`, `useKeyboardShortcuts`, `PageHeader`, `ProgressBar`, `Button`, `Sheet`.
- Produces:
  - `interface LessonSession { lessonId: string; exerciseIds: string[]; queue: string[]; index: number; answers: Record<string, Answer>; attempts: Record<string, number>; results: Record<string, { correct: boolean; firstTry: boolean }>; hearts: number; phase: 'question' | 'feedback' | 'hearts_out' | 'complete'; startedAt: number; requeued: string[] }`
  - `type LessonAction = { type: 'answer'; exerciseId: string; answer: Answer } | { type: 'check'; exerciseId: string; correct: boolean } | { type: 'continue' } | { type: 'refill' } | { type: 'finish' }`
  - `createLessonSession(lesson: OfflineLesson, hearts?: number): LessonSession`
  - `lessonReducer(state: LessonSession, action: LessonAction): LessonSession`
  - `checkAnswer(exercise: Exercise, answer: Answer, answerKey: AnswerKey): { correct: boolean; explanation?: string; correctAnswer: Answer }`
  - `scoreAttempt(lesson: OfflineLesson, session: LessonSession): LocalAttemptResult`
  - `useLessonSession(lessonId: string): { session; lesson; answer; check; next; refill; finish; isLoading; error }`
  - `ExerciseRenderer({ exercise, answer, onChange, disabled })`
  - `useKeyboardShortcuts(map: Record<string, () => void>, enabled?: boolean)`

- [ ] **Step 1: Write failing engine tests**

`engine.test.ts`: a new session queues every exercise once; answering then checking a wrong answer decrements hearts, enters `feedback`, and appends the exercise to the queue once (a second wrong on the same exercise does not append again); Continue advances; finishing the queue sets `complete`; zero hearts sets `hearts_out` after Continue; `refill` restores 5 hearts and returns to `question`. `check-answer.test.ts`: MCQ matches option id; true/false matches boolean; fill-blank trims and ignores case; match-pairs compares unordered pairs; order-steps compares exact order; chart/scam/risk/DCA/story compare their answer shapes; risk allows ±0.01 tolerance. `score-attempt.test.ts`: 8/10 first-try correct → score 0.8, passed; 7/10 → not passed; 10/10 → 100 XP + 10 perfect bonus; a requeued correct answer does not earn first-try XP and does not raise the score; `mistakes` lists every exercise answered incorrectly once. `lesson-session.test.tsx`: answers survive unmount/remount; the session resumes at the same index; the feedback sheet shows the explanation; the hearts-out modal appears at 0; “Practice to refill” calls `refill`. `use-keyboard-shortcuts.test.ts`: number keys call the mapped option, Enter calls check/continue, keys are ignored while an input is focused.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- src/features/lesson` → expected FAIL: modules missing.

- [ ] **Step 3: Implement the pure engine and scoring**

`createLessonSession` sets `exerciseIds` and `queue` from `lesson.exercises.map(e => e.id)`, `index: 0`, `answers: {}`, `attempts: {}`, `hearts: hearts ?? 5`, `phase: 'question'`, `startedAt: Date.now()`, `requeued: []`.

`lessonReducer` rules:

- `answer` stores the answer and clears any previous feedback for that exercise.
- `check` reads `firstTry = (state.attempts[id] ?? 0) === 0`, stores `results[id] = { correct, firstTry }`, and increments `attempts[id]`. A wrong answer decrements hearts; if wrong and `!requeued.includes(id)`, append the id and mark requeued; set `phase: 'feedback'`. A requeued exercise therefore has `firstTry: false` even when answered correctly.
- `continue`: if `hearts <= 0`, set `hearts_out`; else if `index + 1 >= queue.length`, set `complete`; else `index + 1`, `phase: 'question'`.
- `refill`: hearts 5, `phase: 'question'`.
- `finish`: `phase: 'complete'`.

`checkAnswer` normalizes strings (`trim().toLowerCase()`) and compares by type. `scoreAttempt` uses `total = lesson.exercises.length` and `correct` = number of unique exercises whose first attempt was correct. `score = correct / total`; requeued corrections do not raise the score. `passed = score >= 0.8`; `xpEarned = lesson.xpReward === 0 ? 0 : correct * 10 + (score === 1 ? 10 : 0)`; `heartsLost = 5 - session.hearts`; `mistakes` = exercise ids with any incorrect result; `answers` = the latest submitted answer per exercise with its `correct` flag. Use `expo-crypto.randomUUID()` for `clientAttemptId` and ISO timestamps.

- [ ] **Step 4: Implement the session hook and screens**

`useLessonSession` loads the `OfflineLesson` from `useContent()` (which checks registered synthetic lessons before the pack), reads the persisted session from `hodlo:v1:lesson-session`, validates that it matches the lesson id and is not complete, otherwise creates a new one. Persist after every reducer action. Provide `answer`, `check`, `next`, `refill`, `finish` callbacks. `check` calls `checkAnswer`, dispatches `check`, and fires `feedback.correct()`/`feedback.wrong()`. `finish` calls `scoreAttempt`, `useProgressStore.getState().applyLocalResult(result)`, `useSync().enqueue({ clientAttemptId, lessonId, localResult, retries: 0 })`, then `useSync().flush()` best-effort, and returns the result.

Intro (`/lesson/:id`): `PageHeader tier="compact"` with back; `Mascot` with the unit teacher; lesson title, description, XP reward, estimated minutes, exercise count; primary “Start lesson” (or “Practice again” if completed); secondary “Back to Learn”. Starting navigates to `/lesson/:id/play`.

Play (`/lesson/:id/play`): if loading, `Skeleton`; if error, `EmptyState` with Retry. Render `QuestionHeader` (close, `ProgressBar` of completed unique exercises / total, hearts), the current `ExerciseRenderer`, and a primary Check/Continue button. On check, show `FeedbackSheet` as a bottom sheet with correct/wrong color, the explanation, the correct answer when wrong, and Continue. On complete, navigate to `/lesson/:id/result?attemptId=<clientAttemptId>` and clear the persisted session. On close, keep the session for resume and go back.

`QuestionHeader` progress must use unique exercises completed, not queue length. The close button asks “Leave lesson? Your progress is saved.” with Leave/Stay.

- [ ] **Step 5: Implement core exercise components and keyboard support**

`MultipleChoice`: options as full-width `Pressable` cards; selected state uses Lilac fill + Purple border; number badge; `accessibilityRole="radio"`, `accessibilityState={{ selected }}`. `TrueFalse`: two large cards. `FillBlank`: `TextInput` per blank with `autoCapitalize="none"`, `autoCorrect={false}`, and a label per blank.

`useKeyboardShortcuts` is web-only: attach `keydown` to `window`, ignore events when the target is `input`, `textarea`, or `select`, map `1`–`9` to options, `Enter` to the primary action, and clean up on unmount. Play passes the current option handlers and primary action.

- [ ] **Step 6: Run tests and verify a full lesson on web**

```bash
npm test -- src/features/lesson
npm test -- src/hooks
npm run typecheck
npx expo start --web
```

Expected: tests pass; a learner can complete a lesson, see feedback, and reach the result route; refreshing mid-lesson restores the same question and answers.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add lesson engine, core exercises, and playable lesson flow"
```

---

## Task 12: Advanced exercise types

**Files:**
- Create: `src/features/lesson/components/MatchPairs.tsx`, `OrderSteps.tsx`, `ReadChart.tsx`, `SpotScam.tsx`, `RiskCalculator.tsx`, `DcaTimeline.tsx`, `StoryCard.tsx`, `CandleChart.tsx`, `ScamArtifact.tsx`
- Modify: `src/features/lesson/components/ExerciseRenderer.tsx`
- Create tests: `src/features/lesson/__tests__/advanced-exercises.test.tsx`, `candle-chart.test.tsx`

**Interfaces:**
- Consumes: `Exercise` variants, `Answer` variants, `Button`, `Chip`, `useTheme`.
- Produces: each component accepts `{ exercise, answer, onChange, disabled }` and emits exactly one `Answer` variant. `CandleChart({ candles, height? })` renders an accessible SVG with a text summary. `ScamArtifact({ artifact, hotspots, selected, onToggle })` renders a fake DM/email/token page with pressable hotspots.

- [ ] **Step 1: Write failing advanced-exercise tests**

Each test renders the component with a fixture exercise, interacts, and asserts the emitted answer shape: match pairs selects a left then right and removes a pair; order steps moves an item up/down and emits the new order; read chart selects an option and the SVG has an accessible label; spot scam toggles hotspots and emits selected ids; risk calculator rejects a negative/zero position and emits a valid size; DCA timeline emits `buy`/`hold`/`sell`; story card selects an option; candle chart renders one candle per data point and an accessibility summary.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- advanced-exercises` → expected FAIL: modules missing.

- [ ] **Step 3: Implement the components**

`MatchPairs`: two columns; selecting a left item highlights it; selecting a right item creates a pair and removes both from the available lists; paired rows show a remove button. All controls are buttons, no drag required.

`OrderSteps`: a vertical list with Up/Down buttons and a position label (“Step 2 of 5”). Disable Up on the first and Down on the last.

`ReadChart` + `CandleChart`: SVG candles scaled to the data range; green mint for up, coral for down; axis labels for high/low; `accessibilityLabel` summarizes “Chart with N candles; open X, close Y”. Options below.

`SpotScam`: a card that looks like a DM, email, or token page; suspicious text spans are `Pressable` hotspots with `accessibilityRole="checkbox"` and `accessibilityState={{ checked }}`; selected hotspots get a coral outline; a legend explains “Tap the suspicious parts.”

`RiskCalculator`: numeric inputs for position size and stop distance; validate `> 0`; show the computed risk in currency and percent; emit the numbers. `DcaTimeline`: a small line chart of prices plus Buy/Hold/Sell cards; emit the chosen action. `StoryCard`: body text, then a single multiple-choice check; emit `optionId`.

- [ ] **Step 4: Wire all types into `ExerciseRenderer`**

Replace the Task 11 fallback with a complete switch over the 10 exercise types. Each component receives the current answer (or `null`) and `onChange`. The Check button remains disabled until an answer exists.

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- advanced-exercises
npm test -- candle-chart
npm run typecheck
```

Expected: PASS; all 10 exercise types render and emit valid answers.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add advanced exercise renderers"
```

---

## Task 13: Feedback, results, XP, streak, and daily goal

**Files:**
- Create: `app/lesson/[lessonId]/result.tsx`, `src/features/lesson/ResultScreen.tsx`, `components/ResultStat.tsx`, `XpBurst.tsx`, `DailyGoalRing.tsx`, `LevelUpModal.tsx`, `src/features/gamification/streak.ts`, `dailyGoal.ts`, `xp.ts`, `achievements.ts`
- Modify: `src/stores/progressStore.ts`, `src/services/feedback.ts`
- Create tests: `src/features/gamification/__tests__/streak.test.ts`, `daily-goal.test.ts`, `xp.test.ts`, `src/features/lesson/__tests__/result-screen.test.tsx`, `src/stores/__tests__/progress-store-server.test.ts`

**Interfaces:**
- Consumes: `LocalAttemptResult`, `AttemptResult`, `useProgressStore`, `useSyncStatus`, `useApi`, `Mascot`, `PageHeader`, `ProgressRing`, `Button`.
- Produces:
  - `toLocalDateKey(date: Date): string` (`YYYY-MM-DD` in local time).
  - `computeNextStreak(previous: { current: number; longest: number; lastLessonDate: string | null }, now: Date): { current: number; longest: number; lastLessonDate: string }`.
  - `clampDailyGoal(xp: number): number` (10/30/50 only).
  - `dailyProgress(xpToday: number, goal: number): { current: number; goal: number; percent: number; reached: boolean }`.
  - `xpForResult(result: LocalAttemptResult): number`.
  - `mergeAchievements(server: Achievement[], local: Achievement[]): Achievement[]`.
  - Extended `useProgressStore` with `xpToday`, `dailyGoalXp`, `streak`, `lastLessonDate`, `pendingXpByAttempt`, `applyServerResult(result: AttemptResult): Promise<void>`, `setDailyGoal(xp: number): void`.

- [ ] **Step 1: Write failing gamification tests**

`streak.test.ts`: same local date does not increment; next day increments; a gap of two days resets to 1; longest updates; month-end and year-end transitions work; `lastLessonDate` is stored as a local date key. `daily-goal.test.ts`: 10/30/50 accepted, other values clamp to 30; percent caps at 100; reached at `>=`. `xp.test.ts`: 8 correct first-try + 0 bonus = 80; perfect = 110; requeued corrects do not add first-try XP. `progress-store-server.test.ts`: `applyLocalResult` adds pending XP and updates streak; `applyServerResult` replaces pending XP with the server XP, applies the server streak, and is idempotent when called twice with the same attempt. `result-screen.test.tsx`: shows XP, accuracy, time, streak, daily goal; shows “Saved offline” when pending; shows “Synced” when the server result is applied; shows the level-up modal; “Continue” goes to Learn; “Practice mistakes” goes to `/practice/mistakes`.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- src/features/gamification` → expected FAIL: modules missing.

- [ ] **Step 3: Implement gamification utilities and store extensions**

Use local date keys, not UTC, to match the learner's day. `computeNextStreak` compares the previous `lastLessonDate` to today's key: equal → no change; yesterday → +1; otherwise → 1. `longest = max(longest, current)`. `dailyGoalXp` initializes from `session.user.dailyGoalXp` and changes only through `setDailyGoal` (onboarding/profile settings). `applyLocalResult` updates `xpToday` and the streak from the local result, and records the attempt's XP in `pendingXpByAttempt`. `applyServerResult` looks up `pendingXpByAttempt[clientAttemptId]`; if it is absent the result was already reconciled (or never queued), so the call is a no-op. Otherwise it subtracts the local XP, adds the server XP, sets `streak`/`hearts` from the server, updates the lesson's `bestScore` and `passed` from the server result, and deletes the entry. Because `pendingXpByAttempt` is persisted with progress, this stays idempotent across restarts and duplicate sync callbacks.

`feedback.ts`: keep haptics from Task 3; add a `sound` no-op interface that reads `soundEnabled` from the settings store at call time. On web, the first user interaction unlocks audio; until then, no sound. The settings toggle remains the source of truth.

- [ ] **Step 4: Implement the result screen**

Read the result from `useProgressStore.lastResult` only when both `attemptId` and `lessonId` match the route params; a stale `lastResult` from another lesson must never render here. If the matching result is missing and `attemptId` is present, show a loading state and wait for sync; if it never arrives, show an `EmptyState` with “Back to Learn”. The screen shows:

- Pass/fail headline with the unit teacher `Mascot` and mood `celebrate`/`sad`.
- `XpBurst` with `+N XP`; accuracy percent; time as `m:ss`; streak flame count; daily goal ring.
- A pending-sync banner when `useSyncStatus().pending > 0` or the result is not yet synced: “Saved offline — XP and streak will sync when you're back online.”
- A “Synced” check when the server result is applied.
- New achievements as `Badge` tiles.
- `LevelUpModal` when `AttemptResult.levelUp` exists.
- Primary “Continue” → `/(tabs)/learn`; secondary “Practice mistakes” → `/practice/mistakes`; tertiary “Retry lesson” → `/lesson/:id`.

Animations: XP count-up and ring fill use Reanimated; reduced motion shows the final values immediately. No confetti dependency in v1.

- [ ] **Step 5: Run tests and verify the end-to-end lesson result**

```bash
npm test -- src/features/gamification
npm test -- result-screen
npm test -- progress-store-server
npm run typecheck
```

Expected: PASS; completing a lesson online shows synced values; offline shows pending; reconnecting updates to the server result without double XP.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add results, XP, streak, daily goal, and server reconciliation"
```

## Task 14: Practice hub and paper trading

**Files:**
- Create: `app/(tabs)/practice.tsx` (replace placeholder), `app/practice/mistakes.tsx`, `app/practice/trading.tsx`
- Create: `src/features/practice/PracticeScreen.tsx`, `PracticeCard.tsx`, `usePracticeData.ts`, `MistakesReview.tsx`, `src/features/trading/PortfolioScreen.tsx`, `TradeSheet.tsx`, `usePortfolio.ts`, `useQuotes.ts`, `formatMoney.ts`
- Modify: `src/stores/progressStore.ts` (add `mistakeIds`, `clearMistake`)
- Create tests: `src/features/practice/__tests__/practice-data.test.ts`, `practice-screen.test.tsx`, `src/features/trading/__tests__/trade-sheet.test.tsx`, `portfolio.test.tsx`

**Interfaces:**
- Consumes: `useContent`, `useProgressStore`, `useApi`, `PageHeader`, `Card`, `EmptyState`, `OfflineBanner`.
- Produces:
  - `type PracticeKind = 'mistakes' | 'chart' | 'scam' | 'risk' | 'dca' | 'trading' | 'flashcards'`
  - `interface PracticeItem { kind: PracticeKind; title: string; description: string; icon: IconName; href: string; badge?: string }`
  - `selectPracticeLesson(pack: OfflinePack, kind: 'chart' | 'scam' | 'risk' | 'dca'): OfflineLesson | null` — first lesson containing that exercise type.
  - `buildMistakesLesson(pack: OfflinePack, mistakeIds: string[]): OfflineLesson | null` — a synthetic lesson containing only those exercises.
  - `usePortfolio(): { data; isLoading; error; refresh }`
  - `useQuotes(symbols: string[]): { data; isLoading; error }`
  - `formatMoney(value: number, currency?: string): string`

- [ ] **Step 1: Write failing practice and trading tests**

`practice-data.test.ts`: `selectPracticeLesson` returns the Chip lesson for chart, Vex for scam, Grizz for risk, Tank for DCA; `buildMistakesLesson` returns only the requested exercises and `null` when empty; practice cards are unique and link to valid routes. `practice-screen.test.tsx`: renders all seven cards; pressing a card navigates; “Mistakes review” shows a count badge and is disabled when there are no mistakes; offline shows the banner. `trade-sheet.test.tsx`: rejects zero/negative/NaN quantity; rejects a buy above cash; shows estimated cost; calls `placeTrade` with a `clientTradeId`; success closes the sheet and refreshes the portfolio. `portfolio.test.tsx`: renders cash, holdings, total value, and P&L with mint for positive and coral for negative; offline shows cached values with a “last updated” timestamp and disables the trade button.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- src/features/practice` → expected FAIL: modules missing.

- [ ] **Step 3: Implement the practice hub**

`PracticeScreen` renders a `PageHeader tier="standard"` (“Practice”), an intro line, and a grid/list of `PracticeCard`s:

| Card | Behavior |
| --- | --- |
| Mistakes review | `buildMistakesLesson` from `mistakeIds`; disabled with “No mistakes yet” when empty. |
| What just happened? (Chip) | `selectPracticeLesson(pack, 'chart')`; opens the lesson intro. |
| Spot the scam (Vex) | `selectPracticeLesson(pack, 'scam')`. |
| Bear case drill (Grizz) | `selectPracticeLesson(pack, 'risk')`. |
| Hold the line (Tank) | `selectPracticeLesson(pack, 'dca')`. |
| Paper trading | `/practice/trading`; badge “Virtual money”. |
| Flashcards | `/glossary` (Task 16); no new engine. |

The synthetic mistakes lesson has `id: 'practice-mistakes'`, title “Mistakes review”, `xpReward: 0`, and only the selected exercises, with each exercise's answer copied into the synthetic `answerKey` from its source lesson. The mistakes route calls `useContent().registerSynthetic(lesson)` before navigating to `/lesson/practice-mistakes`, so `useLessonSession` can resolve it. Completing it clears those `mistakeIds` on pass; the result screen hides XP when `xpReward === 0`.

`progressStore.applyLocalResult` adds `result.mistakes` to `mistakeIds` (deduplicated); `clearMistake(id)` removes one; `clear()` resets the list.

- [ ] **Step 4: Implement paper trading**

`PortfolioScreen` shows wallet cash, total value, total P&L (mint/coral), a holdings list (symbol, quantity, value, P&L), and a “Trade” button. Use `usePortfolio` and `useQuotes` with TanStack Query; cache is persisted, so offline shows the last snapshot with a timestamp. When offline, disable Trade and show “Trading needs a connection. Your portfolio is shown from the last sync.”

`TradeSheet` is a bottom sheet with symbol selector, Buy/Sell segmented control, quantity input, estimated cost, available cash, and a validation message. On submit, call `api.trading.placeTrade({ symbol, side, quantity }, randomUUID())`; show a loading state; on success, invalidate `['portfolio']` and `['quotes']`, close, and show a toast. Server validation errors (insufficient funds, unknown symbol) render in the sheet.

No real funds, no deposits/withdrawals, no order types beyond market buy/sell. Add the “Virtual money — not financial advice” label.

- [ ] **Step 5: Run tests and verify the practice/trading screens**

```bash
npm test -- src/features/practice
npm test -- src/features/trading
npm run typecheck
```

Expected: PASS; practice cards open the correct lessons; trading validates and formats correctly; offline trading is read-only.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add practice hub, mistakes review, and paper trading"
```

---

## Task 15: Leaderboard, profile, and achievements

**Files:**
- Create: `app/(tabs)/leagues.tsx`, `app/(tabs)/profile.tsx` (replace placeholders)
- Create: `src/features/leagues/LeaguesScreen.tsx`, `LeaderboardRow.tsx`, `TierBadge.tsx`, `Countdown.tsx`, `useLeaderboard.ts`
- Create: `src/features/profile/ProfileScreen.tsx`, `StatsGrid.tsx`, `StreakCalendar.tsx`, `BadgeGrid.tsx`, `useAchievements.ts`, `src/features/profile/avatar.ts`
- Create tests: `src/features/leagues/__tests__/leagues.test.tsx`, `src/features/profile/__tests__/profile.test.tsx`, `src/features/achievements/__tests__/achievements.test.ts`

**Interfaces:**
- Consumes: `useApi`, `useSession`, `useProgressStore`, `useAchievements`, `PageHeader`, `Card`, `Badge`, `EmptyState`, `OfflineBanner`, `Mascot`.
- Produces:
  - `useLeaderboard(): { data: Leaderboard | null; isLoading; error; isStale; refresh }`
  - `useAchievements(): { data: Achievement[]; isLoading; error; refresh }`
  - `TierBadge({ tier })` with Bronze/Silver/Gold/Amethyst/Diamond colors and rounded shield shape.
  - `Countdown({ endsAt })` rendering `d h m` and updating once per minute.
  - `StreakCalendar({ lastLessonDate, currentStreak, today })` rendering the last 30 local days.
  - `avatar.ts`: `avatarInitials(name)`, `avatarColor(id)` (deterministic placeholder until the avatar builder ships).

- [ ] **Step 1: Write failing leaderboard/profile tests**

`leagues.test.tsx`: renders 30 entries with rank, name, XP; highlights the current user; labels promotion/demotion zones; shows the tier badge; shows “Ends in …”; offline with cached data shows a “last updated” banner; no cache shows an `EmptyState`. `profile.test.tsx`: renders display name, avatar initials, XP, streak, lessons completed, accuracy; streak calendar marks the last lesson day; earned badges are colored, locked badges are muted with progress text; “Settings” and “Disclaimer” navigate; offline shows cached profile. `achievements.test.ts`: `mergeAchievements` deduplicates by id, keeps the earliest `earnedAt`, and sorts earned before locked.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- src/features/leagues` → expected FAIL: modules missing.

- [ ] **Step 3: Implement the leaderboard**

`useLeaderboard` uses TanStack Query key `['leaderboard', 'weekly']`, `staleTime: 60_000`, persisted cache. `LeaguesScreen`:

- Header: tier badge, “Weekly league”, countdown.
- Podium for ranks 1–3 with rounded cards.
- List of rows: rank, avatar initials, display name, XP; the current user row has a Lilac background and “You” label.
- Promotion zone (top N) and demotion zone (bottom N) from the API; render colored separators with labels.
- Offline: show cached data + “Showing last synced standings”; no refresh spinner.

Tier colors: Bronze `#C98A5B`, Silver `#B9C2D0`, Gold `#FFD84D`, Amethyst `#B9A8FF`, Diamond `#7FE7F5`; all use Plum text. These are the only additions outside the core palette and are used only for league badges.

- [ ] **Step 4: Implement profile and achievements**

`ProfileScreen` uses `useSession().user` and `useProgressStore` for local stats; `useAchievements` for badges. Sections:

1. Identity: avatar placeholder (initials + deterministic color), display name, character name, “Edit profile” (display name + character; calls `api.profile.update` and stores the response with `useSession().updateUser`; disabled offline).
2. Stats grid: total XP, current streak, lessons completed, accuracy (from local results; show “—” if none).
3. Streak calendar: last 30 days; completed days Mint, today outlined, missed days neutral.
4. Badges: earned first, locked with progress (e.g., 3/7); tap opens a detail sheet with description.
5. Links: Settings, Glossary, Disclaimer, app version.

`useAchievements` fetches `GET /achievements`; on failure, fall back to locally known achievements from `progressStore` (e.g., first lesson, 7-day streak) and mark them as local. `mergeAchievements` handles the union.

- [ ] **Step 5: Run tests and verify the screens**

```bash
npm test -- src/features/leagues
npm test -- src/features/profile
npm test -- src/features/achievements
npm run typecheck
```

Expected: PASS; leaderboard and profile render on mobile and desktop; cached offline views are readable.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add leaderboard, profile, streak calendar, and achievements"
```

---

## Task 16: Settings, glossary, disclaimer, and accessibility

**Files:**
- Create: `app/settings.tsx`, `app/glossary.tsx`, `app/disclaimer.tsx`
- Create: `src/features/settings/SettingsScreen.tsx`, `SettingsRow.tsx`, `ThemePicker.tsx`, `src/features/glossary/GlossaryScreen.tsx`, `src/content/glossary.ts`, `src/features/legal/DisclaimerScreen.tsx`, `src/components/a11y/SkipLink.web.tsx`, `SkipLink.native.tsx`, `src/hooks/useFocusRing.ts`
- Create tests: `src/features/settings/__tests__/settings.test.tsx`, `src/features/glossary/__tests__/glossary.test.tsx`, `src/features/legal/__tests__/disclaimer.test.tsx`, `src/components/a11y/__tests__/skip-link.test.tsx`

**Interfaces:**
- Consumes: `useSettingsStore`, `useSession`, `useProgressStore`, `useApi`, `PageHeader`, `Card`, `Button`, `Chip`.
- Produces:
  - `SettingsScreen` rows: Account, Notifications, Sound, Haptics, Theme, Reduced motion, Font, Language, Privacy, Disclaimer, Glossary, App version. Task 17 adds the web-only “Install app” row with the PWA prompt.
  - `GlossaryScreen` with search, category filter, term list, and detail.
  - `DisclaimerScreen` with the educational-only / paper-trading-only text.
  - `SkipLink` (web-only anchor to `#main-content`; native no-op).
  - `useFocusRing()` returning web-only `outlineStyle`, `outlineColor`, `outlineWidth`, `outlineOffset`.

- [ ] **Step 1: Write failing settings/glossary/disclaimer tests**

`settings.test.tsx`: theme picker changes light/dark/system and persists; reduced motion toggles; haptics toggles persist and a subsequent `feedback.tap()` is a no-op when disabled; font mode switches to the system font; notification pause sets a date 7 days out; sign out clears user data and routes to `/login`; data export builds a JSON object with profile and progress (mock the download/share); delete account calls `api.profile.deleteAccount` and handles 501 with a friendly message. `glossary.test.tsx`: search filters by term and definition; empty query shows all; no matches shows an empty state; selecting a term opens the detail. `disclaimer.test.tsx`: renders the required sentences “educational purposes only”, “not financial advice”, “paper trading only”. `skip-link.test.tsx`: web renders an anchor to `#main-content`; native renders nothing.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- src/features/settings` → expected FAIL: modules missing.

- [ ] **Step 3: Implement settings and privacy actions**

Use `SettingsRow` with a label, optional description, and a right-side control (switch, chevron, value). Group rows under headings. All switches use `accessibilityRole="switch"` and `accessibilityState={{ checked }}`.

- **Notifications:** enabled switch, frequency (Daily / Streak-saver only / Weekly digest), “Pause for a week” (sets `notificationsPausedUntil` to now + 7 days), and a note that push delivery is rolling out. No system permission prompt here; onboarding owns the soft ask.
- **Theme:** System / Light / Dark segmented control.
- **Reduced motion:** switch; immediately affects `useReducedMotion`.
- **Font:** Nunito (default) / System. Label the system option “System font (easier to read)”; OpenDyslexic is a v1.1 asset.
- **Language:** English only; disabled with “More languages soon”.
- **Privacy:** “Export my data” builds `{ exportedAt, profile, progress, settings }` and downloads JSON on web or opens the share sheet on native; “Delete account” calls `DELETE /users/me`, requires a typed confirmation, clears local data on success, and shows “Account deletion isn't available yet” on 501/404.
- **Install app:** not in this task. Task 17 adds the row together with `useInstallPrompt`, avoiding a forward dependency.
- **Sign out:** calls `useSession().signOut()` and routes to `/login`.

- [ ] **Step 4: Implement glossary and disclaimer**

`glossary.ts` exports `GLOSSARY_TERMS: Array<{ id, term, definition, category: 'Basics' | 'Trading' | 'Safety' | 'Risk' }>` with at least 24 terms taught in the first four units (blockchain, wallet, seed phrase, network fee, candlestick, volume, support, resistance, market cap, DCA, diversification, stablecoin, stop-loss, leverage, position size, bear market, phishing, rug pull, approval, hardware wallet, etc.). Definitions are original, one or two sentences, and educational only.

`GlossaryScreen` uses a search input (debounced 150 ms), category chips, and a `FlatList`; each row opens a detail sheet with the term, definition, and “Related lesson” link when available. `DisclaimerScreen` includes the educational-only, no-advice, no-price-prediction, paper-trading-only, and “crypto is volatile; you can lose money” statements, plus a link to the glossary.

- [ ] **Step 5: Implement accessibility plumbing**

Add `eslint-plugin-react-native-a11y` rules to `eslint.config.js` (at minimum `has-accessibility-props`, `no-nested-touchables`). Add `SkipLink` to `AppShell` as the first focusable element on web; the main content column gets `nativeID="main-content"` and `tabIndex={-1}` on web. Add `useFocusRing` to all pressable primitives (Button, Card pressable, tabs, nodes) via a shared style. Ensure every icon-only button has an `accessibilityLabel`; decorative mascots use `accessibilityElementsHidden`/`importantForAccessibility="no"` unless they carry meaning. Add `accessibilityLiveRegion="polite"` to feedback and sync banners.

- [ ] **Step 6: Run tests and verify keyboard/reduced-motion paths**

```bash
npm test -- src/features/settings
npm test -- src/features/glossary
npm test -- src/features/legal
npm test -- skip-link
npm run lint
npm run typecheck
```

Expected: PASS; keyboard focus is visible; reduced motion removes transitions; settings persist across reload.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add settings, glossary, disclaimer, and accessibility plumbing"
```

---

## Task 17: Mascot 3D seam, PWA, E2E, and deployment

**Files:**
- Create: `src/components/mascot/Mascot.web.tsx`, `Mascot.native.tsx`, `MascotBoundary.tsx`, `MascotSlot.tsx`, `README.md`
- Delete: `src/components/mascot/Mascot.tsx` after the platform files land
- Create: `app/+html.tsx`, `public/manifest.json`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `assets/favicon.png`, `assets/brand/icon.svg`, `workbox-config.js`, `scripts/generate-pwa-icons.mjs`, `scripts/check-bundle-size.mjs`
- Create: `src/pwa/useServiceWorkerUpdate.ts`, `useInstallPrompt.ts`, `src/components/pwa/UpdateBanner.tsx`
- Create: `e2e/web/lesson.spec.ts`, `offline.spec.ts`, `deep-link.spec.ts`, `a11y.spec.ts`
- Create tests: `src/components/mascot/__tests__/mascot-seam.test.tsx`, `src/pwa/__tests__/pwa.test.ts`, `scripts/__tests__/size.test.ts`
- Create: `docs/deployment.md`, `maestro/onboarding.yaml`
- Modify: `app.json`, `app/_layout.tsx`, `src/components/layout/AppShell.tsx`, `src/features/settings/SettingsScreen.tsx`, `.github/workflows/ci.yml`, `README.md`, `package.json`

**Interfaces:**
- Consumes: Task 4's `Mascot`/`MascotPlaceholder`, Task 5's `AppShell`, Task 16's `SkipLink`, the whole app.
- Produces:
  - `Mascot` platform resolution: `.web.tsx` and `.native.tsx` both render the placeholder in v1; both accept `MascotProps` and are the future 3D insertion points.
  - `MascotBoundary` catches render/load errors and renders the placeholder.
  - `MascotSlot({ character, mood, size })` reserves `aspectRatio: 1` and never shifts layout.
  - `useServiceWorkerUpdate(): { updateAvailable: boolean; applyUpdate(): void }`.
  - `useInstallPrompt(): { canInstall: boolean; promptInstall(): Promise<void> }`.
  - `npm run icons:generate`, `npm run size:check`, `npm run build:web` producing `dist/` with `sw.js`.
  - `docs/deployment.md` with web hosting, env vars, CORS, EAS Android, and PWA update notes.

- [ ] **Step 1: Write failing mascot/PWA tests**

`mascot-seam.test.tsx`: each character renders a placeholder with its name; a thrown error inside a child is caught by `MascotBoundary` and replaced by the placeholder; `MascotSlot` has `aspectRatio: 1`; reduced motion renders no animation. `pwa.test.ts`: `manifest.json` parses and references existing 192/512 icons; `workbox-config.js` has `swDest: 'dist/sw.js'`, `navigateFallback: '/index.html'`, and does not cache `/auth/*` or POST requests; `useServiceWorkerUpdate` reports `updateAvailable` when `registration.waiting` exists. `size.test.ts`: the bundle-size script fails when the total gzip size exceeds 400 KB and passes below it.

- [ ] **Step 2: Run tests to verify they fail**

`npm test -- mascot` and `npm test -- pwa` → expected FAIL: modules missing.

- [ ] **Step 3: Implement the mascot seam**

`Mascot.web.tsx` and `Mascot.native.tsx` both return `<MascotPlaceholder {...props} />` in v1. Delete the Task 4 `Mascot.tsx` once both exist so Metro resolves exactly one file per platform and there is no dead third path. `MascotBoundary` is a class component with `getDerivedStateFromError`; it renders `MascotPlaceholder` and logs in dev. `MascotSlot` wraps `MascotBoundary` in a `View` with `style={{ width: size, aspectRatio: 1 }}` and `overflow: 'hidden'`.

`src/components/mascot/README.md` documents the 3D integration plan: keep the `MascotProps` inputs (`character`, `mood`, `intensity`, `onPress`); load 3D code with `React.lazy`/dynamic import so it is not in the initial web bundle; cache `.glb`/texture assets in the service worker; use pre-rendered clips on Android first; profile before enabling real-time rendering; always fall back to the placeholder on error/offline. Do not add a 3D dependency in v1.

- [ ] **Step 4: Implement the PWA shell**

`app.json` web config: `output: 'single'`, `bundler: 'metro'`, `favicon: './assets/favicon.png'`, `name: 'Hodlo'`, `shortName: 'Hodlo'`, `themeColor: '#6C4CF1'`, `backgroundColor: '#F5F2FF'`.

`assets/brand/icon.svg`: a rounded Purple square with a white “H” and a Lilac book mark. `scripts/generate-pwa-icons.mjs` uses `sharp` to write `public/icons/icon-192.png`, `icon-512.png`, and `assets/favicon.png`; add `sharp` as a dev dependency and `"icons:generate": "node scripts/generate-pwa-icons.mjs"`.

`public/manifest.json`:

```json
{
  "name": "Hodlo",
  "short_name": "Hodlo",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F5F2FF",
  "theme_color": "#6C4CF1",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

`app/+html.tsx` adds the manifest link, theme-color meta, viewport, and a production-only service-worker registration script. `useServiceWorkerUpdate` listens for `updatefound`/`statechange`, exposes `updateAvailable`, and `applyUpdate` posts `SKIP_WAITING` to the waiting worker then reloads. `UpdateBanner` shows “A new version is ready” with Refresh.

`workbox-config.js`:

```js
module.exports = {
  globDirectory: 'dist',
  globPatterns: ['**/*.{js,css,html,png,svg,woff2,json}'],
  swDest: 'dist/sw.js',
  navigateFallback: '/index.html',
  skipWaiting: false,
  clientsClaim: true,
  runtimeCaching: [
    { urlPattern: /\/content\/pack/, handler: 'NetworkFirst',
      options: { cacheName: 'hodlo-content', networkTimeoutSeconds: 3,
                 expiration: { maxEntries: 10, maxAgeSeconds: 2592000 } } },
    { urlPattern: /\.(png|jpg|jpeg|svg|woff2|glb|gltf)$/, handler: 'CacheFirst',
      options: { cacheName: 'hodlo-assets',
                 expiration: { maxEntries: 60, maxAgeSeconds: 2592000 } } }
  ]
};
```

Do not cache `/auth/*`, `POST` requests, or any user-specific API response in the service worker. The service worker caches only `/content/pack` and static assets; user-specific data is persisted by TanStack Query and cleared on sign-out, because caching it in Workbox would leak one user's data to the next user on the same device. Workbox runtime caching defaults to GET only, but add a negative `urlPattern` guard if needed. Install `workbox-cli` as a dev dependency here, and set `"size:check": "node scripts/check-bundle-size.mjs"`. `npm run build:web` becomes `expo export -p web && workbox generateSW workbox-config.js && npm run size:check`.

`useInstallPrompt` captures `beforeinstallprompt` on web, exposes `canInstall`, and calls `prompt()`. Native returns `{ canInstall: false, promptInstall: async () => {} }`. Add the web-only “Install app” row to `SettingsScreen`; it is hidden when `canInstall` is false.

- [ ] **Step 5: Add the E2E flows**

`e2e/web/lesson.spec.ts`: start in mock mode, complete onboarding with the minimum choices, open the first lesson, answer all questions correctly, expect the result screen with XP and “Synced” or “Saved offline”, then return to Learn and see the node completed.

`e2e/web/offline.spec.ts`: load the app, wait for `navigator.serviceWorker.ready`, complete onboarding, `context.setOffline(true)`, reload, open a downloaded lesson, answer and finish, expect “Saved offline”, `context.setOffline(false)`, wait for sync, expect the result to become synced and the Learn node to stay completed.

`e2e/web/deep-link.spec.ts`: sign in, open `/lesson/<id>/play`, answer one question, reload, expect the same question and answer restored; sign out, open the same URL, sign in, expect to return to the lesson.

`e2e/web/a11y.spec.ts`: `page.emulateMedia({ reducedMotion: 'reduce' })`; complete a lesson using only the keyboard (Tab/Enter/number keys); assert focus is visible; run a basic axe scan if `@axe-core/playwright` is added (optional but recommended).

`maestro/onboarding.yaml`: launch the Android app, tap through onboarding, open the first lesson, answer one question, and assert the feedback sheet appears. Document that it requires an emulator and the backend or mock mode.

- [ ] **Step 6: Update CI, deployment docs, and README**

CI additions: `npm run icons:generate`, `npm run build:web` (includes `size:check`), Playwright job, upload `dist/` and `playwright-report/`. Add a manual `workflow_dispatch` Android job using `eas build --platform android --profile preview` with `EXPO_TOKEN`; do not run it on every PR.

`docs/deployment.md`: environment variables (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_MODE`), static hosting with SPA fallback, HTTPS requirement for service workers, cache/update behavior, CORS origin + credentials, cookie attributes, EAS Android build, and the “bump the service worker cache version on every deploy” rule. `README.md`: local run (`npm start`, `npm run web`, `npm run android`), backend URL, mock mode, test commands, and links to the contract/deployment docs.

- [ ] **Step 7: Run the full verification**

```bash
npm run lint
npm run typecheck
npm test -- --ci
npm run icons:generate
npm run build:web
npm run test:e2e
```

Expected: all pass; `dist/sw.js` exists; the offline E2E flow syncs exactly once; the bundle-size check passes.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add mascot seam, PWA shell, E2E flows, and deployment docs"
```

---

## Self-review: spec and issue coverage

| Requirement | Task |
| --- | --- |
| Expo universal app, Android + web | 1 |
| Design tokens, type, spacing, radii, ledges, light/dark | 3 |
| Header tiers, bottom tabs, rail, sidebar | 4, 5 |
| Onboarding (splash, level, interests, goal, cast, placement, account, notification soft ask) | 9 |
| Learn path, unit banners, nodes, locked/completed, jump to unit | 10 |
| Lesson intro, 10 exercise types, feedback, hearts | 11, 12 |
| Results, XP, streak, daily goal, level-up | 13 |
| Practice hub, mistakes review, paper trading | 14 |
| Leaderboard, profile, streak calendar, badges | 15 |
| Settings, glossary, disclaimer, accessibility | 16 |
| Offline content, outbox, sync, duplicate protection | 7, 13 |
| PWA, service worker, install, offline shell | 17 |
| API contract, mock adapter, backend handshake | 6 |
| 3D-ready mascot slot with placeholder fallback | 4, 17 |
| Tests, CI, deployment docs | 2, 17 |
| Frontend issues #1–#11 | all tasks; issue edits in “Scope and GitHub issue alignment” |
| Backend issues #6–#26 | Task 6 contract + Tasks 8–15 |

**Deferred with explicit seams:** Quests/Shop/Friends/push delivery (settings + notification preference stubs), chest rewards (decorative node only), avatar builder (initials placeholder), original sound set (haptic-only feedback service), real-time 3D (mascot interface + README), 8–12 unit art (placeholder banners), iOS release (Expo keeps it buildable).

**Open questions for review:** see the spec’s final section. The plan assumes Expo universal, cookie auth, bundled answer keys for offline grading, and v1 scope = issues #1–#11.

## Execution handoff

The GitHub issue edits in “Scope and GitHub issue alignment” are already applied, so execution can start at Task 1. Each task ends with a commit and an independently verifiable result. The recommended execution order is 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17; Tasks 12 and 14 can run in parallel once Task 11 lands, and Task 16 can start after Task 5 if accessibility is the priority.

