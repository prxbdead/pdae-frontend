# Hodlo API contract (frontend handshake)

> **Status:** implemented client contract as of 2026-11-23.
> **Owner:** frontend (client), backend (.NET 10).
> **Source of truth in code:** `src/api/contracts.ts` (Zod schemas),
> `src/api/http.ts` (paths and headers), `src/api/mock.ts` (mock adapter).

The frontend ships against the schemas and paths below. The mock adapter
implements the same interface, so either side can be built or demoed without
the other. Merge seam: request and response bodies are parsed with the Zod
schemas, so a backend field rename fails loudly in development instead of
reaching a learner.

## 1. Environment

| Variable | Values | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | `http://localhost:5215` (default) | Base URL. Android emulators default to `http://10.0.2.2:5215`. |
| `EXPO_PUBLIC_API_MODE` | `mock` (default), `http` | `mock` uses the in-memory adapter; `http` uses the real backend. |
| `EXPO_PUBLIC_APP_ENV` | `development`, `production` | Build labelling only. |

## 2. Transport rules

- JSON only. Requests send `Accept: application/json`, and
  `Content-Type: application/json` when there is a body.
- **Cookies:** every request uses `credentials: 'include'`. Auth is
  cookie-based; no bearer token in v1.
- **Timezone:** every request sends
  `X-Timezone: <IANA zone>` so the server can compute local-day streaks.
- **Timeout:** the client aborts after 15 s and maps the failure to
  `ApiError.status = 0`.
- **Idempotency:** attempt and trade submissions send an
  `Idempotency-Key` header containing a client-generated UUID
  (`clientAttemptId` / `clientTradeId`).

## 3. Error shape

ASP.NET Core `ProblemDetails`, parsed as:

```ts
interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  code?: string;
}
```

The client maps this to `ApiError { status, code, details }`. `detail` is
shown to the learner; `status` decides retry behaviour:

- `401` pauses sync and keeps queued attempts.
- `0` and `5xx` are retryable with exponential backoff.
- Every other `4xx` is terminal for that attempt and is marked failed.

## 4. Endpoints implemented by the client

`Σ` = request/response type defined in `src/api/contracts.ts`.

| Area | Method and path | Request | Response |
| --- | --- | --- | --- |
| Auth | `POST /auth/register` | `RegisterInput` | `UserProfile` |
| Auth | `POST /auth/login` | `LoginInput` | `UserProfile` |
| Auth | `POST /auth/logout` | — | empty |
| Auth | `GET /users/me` | — | `UserProfile` |
| Profile | `PATCH /users/me` | `UpdateProfileInput` | `UserProfile` |
| Profile | `DELETE /users/me` | — | empty (404/501 = not available) |
| Content | `GET /content/modules` | — | `LearningModule[]` |
| Content | `GET /content/modules/{moduleId}/lessons` | — | `LessonSummary[]` |
| Content | `GET /content/lessons/{lessonId}` | — | `Lesson` (**no answer key**) |
| Offline | `GET /content/pack?version=` **NEW** | — | `OfflinePack` (includes answer keys) |
| Progress | `GET /users/me/progress` **NEW** | — | `LessonProgress[]` |
| Attempts | `POST /attempts` | `SubmitAttemptInput` | `AttemptResult` |
| Attempts | header `Idempotency-Key` **NEW** | client attempt UUID | — |
| Leaderboard | `GET /leaderboard/weekly` | — | `Leaderboard` |
| Achievements | `GET /achievements` | — | `Achievement[]` |
| Market | `GET /trading/quotes?symbols=A,B` | — | `Quote[]` |
| Portfolio | `GET /trading/portfolio` | — | `Portfolio` |
| Trades | `POST /trading/trades` | `PlaceTradeInput` | `Trade` |
| Trades | header `Idempotency-Key` **NEW** | client trade UUID | — |
| Health | `GET /health` | — | `{ status: string }` |

## 5. Core shapes

```ts
type CharacterId = 'hodlo' | 'chip' | 'tank' | 'grizz' | 'vex';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  characterId: CharacterId;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  dailyGoalXp: number;
  xp: number;
  gems: number;
  hearts: number;
  maxHearts: number;
  timezone: string;
  streak: StreakState;
  onboardingCompleted: boolean;
  createdAt: string;
}

interface StreakState {
  current: number;
  longest: number;
  lastLessonDate: string | null; // YYYY-MM-DD in the learner's local day
  freezesEquipped: number;
  restDay: number | null; // 0 = Sunday
}

interface LearningModule {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  unitNumber: number;
  teacherCharacterId: CharacterId;
  accent: 'purple' | 'mint' | 'coral' | 'yellow' | 'lilac';
  lessonCount: number;
}

interface LessonSummary {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  kind: 'lesson' | 'chest' | 'character_intro';
  xpReward: number;
  estimatedMinutes: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  bestScore?: number;
}

interface Lesson extends LessonSummary {
  exercises: Exercise[]; // GET /content/lessons returns this, never answerKey
}

interface OfflineLesson extends Lesson {
  answerKey: Record<string, Answer>; // offline pack only
}

interface OfflinePack {
  version: string;
  generatedAt: string;
  modules: LearningModule[];
  lessons: OfflineLesson[];
}
```

### Exercise and answer variants

Ten discriminated unions keyed by `type`. Every exercise has `id`, `prompt`,
and an optional `explanation`.

| `type` | Exercise fields | Answer |
| --- | --- | --- |
| `multiple_choice` | `options: {id,text}[]` | `{ optionId }` |
| `true_false` | `statement` | `{ value: boolean }` |
| `fill_blank` | `parts: string[]`, `blankCount` | `{ values: string[] }` |
| `match_pairs` | `left`, `right` (`{id,text}[]`) | `{ pairs: {left,right}[] }` |
| `order_steps` | `steps: {id,text}[]` | `{ stepIds: string[] }` (exact order) |
| `read_chart` | `candles: {open,high,low,close}[]`, `options` | `{ optionId }` |
| `spot_scam` | `artifact: {kind,title,body}`, `hotspots: {id,label,text}[]` | `{ hotspotIds: string[] }` (set) |
| `risk_calculator` | `balance`, `riskPercent`, `entry`, `stop` | `{ positionSize: number }` |
| `dca_timeline` | `prices: number[]`, `options: ('buy'|'hold'|'sell')[]` | `{ action }` |
| `story_card` | `body`, `options` | `{ optionId }` |

Answer comparison is per type: text is trimmed and case-folded, pairs and
hotspots are unordered sets, step order is exact, and position size accepts a
`±0.01` tolerance.

### Attempt submission

```ts
interface SubmitAttemptInput {
  lessonId: string;
  startedAt: string; // ISO
  completedAt: string; // ISO
  answers: { exerciseId: string; answer: Answer; correct: boolean }[];
  score: number; // 0..1, first-try correct / total
  passed: boolean; // score >= 0.8
  xpEarned: number; // client estimate; server is authoritative
  heartsLost: number;
  mistakes: string[]; // exercise ids wrong at least once
}

interface AttemptResult {
  attemptId: string;
  clientAttemptId: string;
  lessonId: string;
  score: number;
  passed: boolean;
  xpEarned: number; // server-authoritative
  hearts: number;
  streak: StreakState; // server-authoritative
  levelUp?: { level: number; title: string };
  newAchievements: Achievement[];
}
```

**Server rules the client depends on:**

1. Re-score the submitted answers; do not trust `score` or `xpEarned`.
2. Return the original `AttemptResult` for a repeated `Idempotency-Key`,
   byte-for-byte identical where possible.
3. Never award XP, streak progress, hearts, or achievements twice for one
   `clientAttemptId`.
4. `lastLessonDate` is a local-day key derived from `X-Timezone`.

### Leaderboard, portfolio, trades

```ts
interface Leaderboard {
  tier: 'bronze' | 'silver' | 'gold' | 'amethyst' | 'diamond';
  endsAt: string;
  currentUserId: string;
  promotionZone: number;
  demotionZone: number;
  entries: { userId; displayName; xp; rank; tier }[]; // 30 entries
}

interface Portfolio {
  cash: number;
  totalValue: number;
  totalPnl: number;
  holdings: {
    symbol; quantity; averageCost; currentPrice; value; pnl;
  }[];
  updatedAt: string;
}

interface PlaceTradeInput {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number; // > 0
}
```

Paper trading only. The server must reject trades that exceed cash or holding
quantity, unknown symbols, and non-positive quantities. No deposits,
withdrawals, leverage, or order types beyond market buy/sell.

## 6. Cookie and CORS requirements

- CORS must allow the deployed web origin **and**
  `http://localhost:8081` with `AllowCredentials()`.
- `AllowAnyOrigin()` cannot be combined with credentials; use
  `SetIsOriginAllowed`/`WithOrigins` with an explicit list.
- Cookies: `HttpOnly`, `Secure` in production, `SameSite=Lax` for the
  web/PWA origin. Android relies on the platform cookie store.
- The client never stores a bearer token in v1. If native cookie persistence
  fails on the Android emulator, the agreed fallback is a `SecureStore`
  bearer token, not a second auth scheme.

## 7. Offline and sync semantics

- The bundled/cached `OfflinePack` is the offline source of content and is the
  only response that may contain `answerKey`.
- A finished attempt is graded locally, saved, and written to a persisted
  outbox under `hodlo:v1:outbox:{userId}`.
- Sync drains the outbox FIFO. A `401` pauses sync and keeps the queue; `0` and
  `5xx` retry with exponential backoff (5 s doubling, capped at 5 min); other
  `4xx` mark the item failed.
- Reconnect, app foreground, and next launch all trigger a flush.
- Locally applied XP is reconciled by `clientAttemptId` exactly once. Pending
  XP is visible to the learner as “Saved offline”.

## 8. Caching boundaries (PWA)

- The service worker caches static assets and `GET /content/pack` only.
- It must never cache `/auth/*`, `POST` requests, or user-scoped API
  responses; user data lives in TanStack Query's persisted cache and is
  cleared on sign-out.
- Sign-out clears progress, outbox, session, and the query cache; the content
  pack and device settings remain so the next launch works offline.

## 9. Backend handshake checklist

- [ ] CORS allows the web origin and `localhost:8081` with credentials.
- [ ] Auth cookies are `HttpOnly` and `Secure` in production.
- [ ] `GET /content/lessons/{id}` never includes `answerKey`.
- [ ] `GET /content/pack` includes answer keys and is cacheable by version.
- [ ] Attempts are re-scored server-side; client XP is advisory only.
- [ ] `Idempotency-Key` on attempts and trades returns the original result.
- [ ] Streak/XP/achievements are applied at most once per `clientAttemptId`.
- [ ] `X-Timezone` is accepted and used for local-day streak logic.
- [ ] `DELETE /users/me` either works or returns a documented 501.
- [ ] `ProblemDetails` is returned for every `4xx`/`5xx`.

## 10. Known differences from the design summary

The design summary (`docs/superpowers/specs/2026-11-22-hodlo-frontend-design.md`,
“API contract summary”) uses a shorter path style. The client currently
implements the paths in §4. Confirm which set the backend will ship **before**
integration; the client paths are centralized in `src/api/http.ts`.

| Design summary | Implemented client |
| --- | --- |
| `PUT /users/me` | `PATCH /users/me` |
| `GET /modules` | `GET /content/modules` |
| `GET /modules/{id}/lessons` | `GET /content/modules/{id}/lessons` |
| `GET /lessons/{id}` | `GET /content/lessons/{id}` |
| `POST /quiz-attempts` | `POST /attempts` |
| `GET /leaderboard?period=weekly` | `GET /leaderboard/weekly` |
| `GET /market/quotes?symbols=` | `GET /trading/quotes?symbols=` |
| `GET /portfolio` | `GET /trading/portfolio` |
| `POST /trades` | `POST /trading/trades` |

Either rename is a localized change; none affect payload shapes, idempotency,
or offline behaviour.
