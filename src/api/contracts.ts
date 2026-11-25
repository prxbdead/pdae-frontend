// zod/mini is used instead of the full zod entry: the root bundle imports this
// file, and mini's functional API tree-shakes to only what is referenced here.
import * as z from './schema';

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

export const characterIdSchema = z.enumOf([
  'hodlo',
  'chip',
  'tank',
  'grizz',
  'vex',
]);

export const experienceLevelSchema = z.enumOf([
  'beginner',
  'intermediate',
  'advanced',
]);

export const lessonStatusSchema = z.enumOf([
  'locked',
  'available',
  'in_progress',
  'completed',
]);

export const accentSchema = z.enumOf([
  'purple',
  'mint',
  'coral',
  'yellow',
  'lilac',
]);

/* ------------------------------------------------------------------ */
/* Auth and profile                                                    */
/* ------------------------------------------------------------------ */

export const streakStateSchema = z.object({
  current: z.int().check(z.nonnegative()),
  longest: z.int().check(z.nonnegative()),
  lastLessonDate: z.nullable(z.string()),
  freezesEquipped: z.int().check(z.nonnegative()),
  restDay: z.nullable(z.int().check(z.gte(0), z.lte(6))),
});

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  characterId: characterIdSchema,
  experienceLevel: experienceLevelSchema,
  interests: z.array(z.string()),
  dailyGoalXp: z.int().check(z.positive()),
  xp: z.int().check(z.nonnegative()),
  gems: z.int().check(z.nonnegative()),
  hearts: z.int().check(z.nonnegative()),
  maxHearts: z.int().check(z.positive()),
  timezone: z.string(),
  streak: streakStateSchema,
  onboardingCompleted: z.boolean(),
  createdAt: z.string(),
});

export const updateProfileInputSchema = z.object({
  displayName: z.optional(z.string().check(z.minLength(1), z.maxLength(40))),
  characterId: z.optional(characterIdSchema),
  experienceLevel: z.optional(experienceLevelSchema),
  interests: z.optional(z.array(z.string())),
  dailyGoalXp: z.optional(z.int().check(z.positive())),
  timezone: z.optional(z.string()),
  onboardingCompleted: z.optional(z.boolean()),
});

export const registerInputSchema = z.object({
  displayName: z.string().check(z.minLength(1), z.maxLength(40)),
  email: z.string().check(z.email()),
  password: z.string().check(z.minLength(8)),
});

export const loginInputSchema = z.object({
  email: z.string().check(z.email()),
  password: z.string().check(z.minLength(1)),
});

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export const learningModuleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.int().check(z.nonnegative()),
  unitNumber: z.int().check(z.positive()),
  teacherCharacterId: characterIdSchema,
  accent: accentSchema,
  lessonCount: z.int().check(z.nonnegative()),
});

export const lessonSummarySchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.int().check(z.nonnegative()),
  kind: z.enumOf(['lesson', 'chest', 'character_intro']),
  xpReward: z.int().check(z.nonnegative()),
  estimatedMinutes: z.number().check(z.positive()),
  status: lessonStatusSchema,
  bestScore: z.optional(z.number().check(z.gte(0), z.lte(1))),
});

export const lessonProgressSchema = z.object({
  lessonId: z.string(),
  status: lessonStatusSchema,
  bestScore: z.optional(z.number().check(z.gte(0), z.lte(1))),
  attempts: z.int().check(z.nonnegative()),
});

const optionSchema = z.object({
  id: z.string(),
  text: z.string(),
});

const candleSchema = z.object({
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
});

const baseExerciseFields = {
  id: z.string(),
  prompt: z.string(),
  explanation: z.optional(z.string()),
};

export const exerciseSchema = z.discriminatedUnion('type', [
  z.object({
    ...baseExerciseFields,
    type: z.literal('multiple_choice'),
    options: z.array(optionSchema).check(z.minLength(2)),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('true_false'),
    statement: z.string(),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('fill_blank'),
    parts: z.array(z.string()).check(z.minLength(2)),
    blankCount: z.int().check(z.positive()),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('match_pairs'),
    left: z.array(optionSchema).check(z.minLength(2)),
    right: z.array(optionSchema).check(z.minLength(2)),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('order_steps'),
    steps: z.array(optionSchema).check(z.minLength(2)),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('read_chart'),
    candles: z.array(candleSchema).check(z.minLength(1)),
    options: z.array(optionSchema).check(z.minLength(2)),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('spot_scam'),
    artifact: z.object({
      kind: z.enumOf(['dm', 'email', 'token_page']),
      title: z.string(),
      body: z.string(),
    }),
    hotspots: z
      .array(z.extend(optionSchema, { label: z.string(), text: z.string() }))
      .check(z.minLength(1)),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('risk_calculator'),
    balance: z.number().check(z.positive()),
    riskPercent: z.number().check(z.positive()),
    entry: z.number().check(z.positive()),
    stop: z.number().check(z.positive()),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('dca_timeline'),
    prices: z.array(z.number().check(z.positive())).check(z.minLength(2)),
    options: z.array(z.enumOf(['buy', 'hold', 'sell'])).check(z.minLength(2)),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('story_card'),
    body: z.string(),
    options: z.array(optionSchema).check(z.minLength(2)),
  }),
]);

export const EXERCISE_TYPES = [
  'multiple_choice',
  'true_false',
  'fill_blank',
  'match_pairs',
  'order_steps',
  'read_chart',
  'spot_scam',
  'risk_calculator',
  'dca_timeline',
  'story_card',
] as const;

export const answerSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('multiple_choice'), optionId: z.string() }),
  z.object({ type: z.literal('true_false'), value: z.boolean() }),
  z.object({ type: z.literal('fill_blank'), values: z.array(z.string()) }),
  z.object({
    type: z.literal('match_pairs'),
    pairs: z.array(z.object({ left: z.string(), right: z.string() })),
  }),
  z.object({ type: z.literal('order_steps'), stepIds: z.array(z.string()) }),
  z.object({ type: z.literal('read_chart'), optionId: z.string() }),
  z.object({ type: z.literal('spot_scam'), hotspotIds: z.array(z.string()) }),
  z.object({ type: z.literal('risk_calculator'), positionSize: z.number() }),
  z.object({
    type: z.literal('dca_timeline'),
    action: z.enumOf(['buy', 'hold', 'sell']),
  }),
  z.object({ type: z.literal('story_card'), optionId: z.string() }),
]);

export const answerKeySchema = z.record(z.string(), answerSchema);

export const lessonSchema = z.extend(lessonSummarySchema, {
  exercises: z.array(exerciseSchema),
});

export const offlineLessonSchema = z.extend(lessonSchema, {
  answerKey: answerKeySchema,
});

export const offlinePackSchema = z.object({
  version: z.string(),
  generatedAt: z.string(),
  modules: z.array(learningModuleSchema),
  lessons: z.array(offlineLessonSchema),
});

/* ------------------------------------------------------------------ */
/* Attempts                                                            */
/* ------------------------------------------------------------------ */

export const submittedAnswerSchema = z.object({
  exerciseId: z.string(),
  answer: answerSchema,
  correct: z.boolean(),
});

export const submitAttemptInputSchema = z.object({
  lessonId: z.string(),
  startedAt: z.string(),
  completedAt: z.string(),
  answers: z.array(submittedAnswerSchema),
  score: z.number().check(z.gte(0), z.lte(1)),
  passed: z.boolean(),
  xpEarned: z.int().check(z.nonnegative()),
  heartsLost: z.int().check(z.nonnegative()),
  mistakes: z.array(z.string()),
});

export const levelUpSchema = z.object({
  level: z.int().check(z.positive()),
  title: z.string(),
});

export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  earnedAt: z.nullable(z.string()),
  progress: z.number().check(z.nonnegative()),
  target: z.number().check(z.positive()),
});

export const attemptResultSchema = z.object({
  attemptId: z.string(),
  clientAttemptId: z.string(),
  lessonId: z.string(),
  score: z.number().check(z.gte(0), z.lte(1)),
  passed: z.boolean(),
  xpEarned: z.int().check(z.nonnegative()),
  hearts: z.int().check(z.nonnegative()),
  streak: streakStateSchema,
  levelUp: z.optional(levelUpSchema),
  newAchievements: z.array(achievementSchema),
});

/* ------------------------------------------------------------------ */
/* Leaderboard                                                         */
/* ------------------------------------------------------------------ */

export const leaderboardTierSchema = z.enumOf([
  'bronze',
  'silver',
  'gold',
  'amethyst',
  'diamond',
]);

export const leaderboardEntrySchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  xp: z.int().check(z.nonnegative()),
  rank: z.int().check(z.positive()),
  tier: leaderboardTierSchema,
});

export const leaderboardSchema = z.object({
  tier: leaderboardTierSchema,
  endsAt: z.string(),
  currentUserId: z.string(),
  promotionZone: z.int().check(z.nonnegative()),
  demotionZone: z.int().check(z.nonnegative()),
  entries: z.array(leaderboardEntrySchema),
});

/* ------------------------------------------------------------------ */
/* Trading (paper only)                                                */
/* ------------------------------------------------------------------ */

export const holdingSchema = z.object({
  symbol: z.string(),
  quantity: z.number().check(z.gte(0)),
  averageCost: z.number().check(z.gte(0)),
  currentPrice: z.number().check(z.gte(0)),
  value: z.number().check(z.gte(0)),
  pnl: z.number(),
});

export const portfolioSchema = z.object({
  cash: z.number().check(z.gte(0)),
  totalValue: z.number().check(z.gte(0)),
  totalPnl: z.number(),
  holdings: z.array(holdingSchema),
  updatedAt: z.string(),
});

export const quoteSchema = z.object({
  symbol: z.string(),
  price: z.number().check(z.gte(0)),
  change24h: z.number(),
  updatedAt: z.string(),
});

export const tradeSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  side: z.enumOf(['buy', 'sell']),
  quantity: z.number().check(z.positive()),
  price: z.number().check(z.gte(0)),
  executedAt: z.string(),
});

export const placeTradeInputSchema = z.object({
  symbol: z.string(),
  side: z.enumOf(['buy', 'sell']),
  quantity: z.number().check(z.positive()),
});

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

export const problemDetailsSchema = z.object({
  type: z.optional(z.string()),
  title: z.string(),
  status: z.int(),
  detail: z.optional(z.string()),
  code: z.optional(z.string()),
});

/* ------------------------------------------------------------------ */
/* Inferred types                                                      */
/* ------------------------------------------------------------------ */

export type CharacterId = z.Infer<typeof characterIdSchema>;
export type ExperienceLevel = z.Infer<typeof experienceLevelSchema>;
export type LessonStatus = z.Infer<typeof lessonStatusSchema>;
export type StreakState = z.Infer<typeof streakStateSchema>;
export type UserProfile = z.Infer<typeof userProfileSchema>;
export type UpdateProfileInput = z.Infer<typeof updateProfileInputSchema>;
export type RegisterInput = z.Infer<typeof registerInputSchema>;
export type LoginInput = z.Infer<typeof loginInputSchema>;
export type LearningModule = z.Infer<typeof learningModuleSchema>;
export type LessonSummary = z.Infer<typeof lessonSummarySchema>;
export type LessonProgress = z.Infer<typeof lessonProgressSchema>;
export type Exercise = z.Infer<typeof exerciseSchema>;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];
export type Answer = z.Infer<typeof answerSchema>;
export type AnswerKey = z.Infer<typeof answerKeySchema>;
export type Lesson = z.Infer<typeof lessonSchema>;
export type OfflineLesson = z.Infer<typeof offlineLessonSchema>;
export type OfflinePack = z.Infer<typeof offlinePackSchema>;
export type SubmittedAnswer = z.Infer<typeof submittedAnswerSchema>;
export type SubmitAttemptInput = z.Infer<typeof submitAttemptInputSchema>;
export type LevelUp = z.Infer<typeof levelUpSchema>;
export type Achievement = z.Infer<typeof achievementSchema>;
export type AttemptResult = z.Infer<typeof attemptResultSchema>;
export type LeaderboardTier = z.Infer<typeof leaderboardTierSchema>;
export type LeaderboardEntry = z.Infer<typeof leaderboardEntrySchema>;
export type Leaderboard = z.Infer<typeof leaderboardSchema>;
export type Holding = z.Infer<typeof holdingSchema>;
export type Portfolio = z.Infer<typeof portfolioSchema>;
export type Quote = z.Infer<typeof quoteSchema>;
export type Trade = z.Infer<typeof tradeSchema>;
export type PlaceTradeInput = z.Infer<typeof placeTradeInputSchema>;
export type ProblemDetails = z.Infer<typeof problemDetailsSchema>;

/* ------------------------------------------------------------------ */
/* API surface                                                         */
/* ------------------------------------------------------------------ */

export interface ApiClient {
  auth: {
    register(input: RegisterInput): Promise<UserProfile>;
    login(input: LoginInput): Promise<UserProfile>;
    logout(): Promise<void>;
    me(): Promise<UserProfile>;
  };
  profile: {
    update(input: UpdateProfileInput): Promise<UserProfile>;
    deleteAccount(): Promise<void>;
  };
  content: {
    listModules(): Promise<LearningModule[]>;
    listLessons(moduleId: string): Promise<LessonSummary[]>;
    getLesson(lessonId: string): Promise<Lesson>;
    getOfflinePack(version?: string): Promise<OfflinePack>;
  };
  progress: {
    getProgress(): Promise<LessonProgress[]>;
  };
  attempts: {
    submit(
      input: SubmitAttemptInput,
      clientAttemptId: string,
    ): Promise<AttemptResult>;
  };
  leaderboard: {
    getWeekly(): Promise<Leaderboard>;
  };
  achievements: {
    list(): Promise<Achievement[]>;
  };
  trading: {
    getPortfolio(): Promise<Portfolio>;
    getQuotes(symbols: string[]): Promise<Quote[]>;
    placeTrade(input: PlaceTradeInput, clientTradeId: string): Promise<Trade>;
  };
}
