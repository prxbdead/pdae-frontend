import { z } from 'zod';

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

export const characterIdSchema = z.enum([
  'hodlo',
  'chip',
  'tank',
  'grizz',
  'vex',
]);

export const experienceLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);

export const lessonStatusSchema = z.enum([
  'locked',
  'available',
  'in_progress',
  'completed',
]);

export const accentSchema = z.enum([
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
  current: z.number().int().nonnegative(),
  longest: z.number().int().nonnegative(),
  lastLessonDate: z.string().nullable(),
  freezesEquipped: z.number().int().nonnegative(),
  restDay: z.number().int().min(0).max(6).nullable(),
});

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  characterId: characterIdSchema,
  experienceLevel: experienceLevelSchema,
  interests: z.array(z.string()),
  dailyGoalXp: z.number().int().positive(),
  xp: z.number().int().nonnegative(),
  gems: z.number().int().nonnegative(),
  hearts: z.number().int().nonnegative(),
  maxHearts: z.number().int().positive(),
  timezone: z.string(),
  streak: streakStateSchema,
  onboardingCompleted: z.boolean(),
  createdAt: z.string(),
});

export const updateProfileInputSchema = z.object({
  displayName: z.string().min(1).max(40).optional(),
  characterId: characterIdSchema.optional(),
  experienceLevel: experienceLevelSchema.optional(),
  interests: z.array(z.string()).optional(),
  dailyGoalXp: z.number().int().positive().optional(),
  timezone: z.string().optional(),
  onboardingCompleted: z.boolean().optional(),
});

export const registerInputSchema = z.object({
  displayName: z.string().min(1).max(40),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export const learningModuleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number().int().nonnegative(),
  unitNumber: z.number().int().positive(),
  teacherCharacterId: characterIdSchema,
  accent: accentSchema,
  lessonCount: z.number().int().nonnegative(),
});

export const lessonSummarySchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number().int().nonnegative(),
  kind: z.enum(['lesson', 'chest', 'character_intro']),
  xpReward: z.number().int().nonnegative(),
  estimatedMinutes: z.number().positive(),
  status: lessonStatusSchema,
  bestScore: z.number().min(0).max(1).optional(),
});

export const lessonProgressSchema = z.object({
  lessonId: z.string(),
  status: lessonStatusSchema,
  bestScore: z.number().min(0).max(1).optional(),
  attempts: z.number().int().nonnegative(),
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
  explanation: z.string().optional(),
};

export const exerciseSchema = z.discriminatedUnion('type', [
  z.object({
    ...baseExerciseFields,
    type: z.literal('multiple_choice'),
    options: z.array(optionSchema).min(2),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('true_false'),
    statement: z.string(),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('fill_blank'),
    parts: z.array(z.string()).min(2),
    blankCount: z.number().int().positive(),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('match_pairs'),
    left: z.array(optionSchema).min(2),
    right: z.array(optionSchema).min(2),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('order_steps'),
    steps: z.array(optionSchema).min(2),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('read_chart'),
    candles: z.array(candleSchema).min(1),
    options: z.array(optionSchema).min(2),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('spot_scam'),
    artifact: z.object({
      kind: z.enum(['dm', 'email', 'token_page']),
      title: z.string(),
      body: z.string(),
    }),
    hotspots: z.array(optionSchema.extend({ text: z.string() })).min(1),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('risk_calculator'),
    balance: z.number().positive(),
    riskPercent: z.number().positive(),
    entry: z.number().positive(),
    stop: z.number().positive(),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('dca_timeline'),
    prices: z.array(z.number().positive()).min(2),
    options: z.array(z.enum(['buy', 'hold', 'sell'])).min(2),
  }),
  z.object({
    ...baseExerciseFields,
    type: z.literal('story_card'),
    body: z.string(),
    options: z.array(optionSchema).min(2),
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
    action: z.enum(['buy', 'hold', 'sell']),
  }),
  z.object({ type: z.literal('story_card'), optionId: z.string() }),
]);

export const answerKeySchema = z.record(z.string(), answerSchema);

export const lessonSchema = lessonSummarySchema.extend({
  exercises: z.array(exerciseSchema),
});

export const offlineLessonSchema = lessonSchema.extend({
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
  score: z.number().min(0).max(1),
  passed: z.boolean(),
  xpEarned: z.number().int().nonnegative(),
  heartsLost: z.number().int().nonnegative(),
  mistakes: z.array(z.string()),
});

export const levelUpSchema = z.object({
  level: z.number().int().positive(),
  title: z.string(),
});

export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  earnedAt: z.string().nullable(),
  progress: z.number().nonnegative(),
  target: z.number().positive(),
});

export const attemptResultSchema = z.object({
  attemptId: z.string(),
  clientAttemptId: z.string(),
  lessonId: z.string(),
  score: z.number().min(0).max(1),
  passed: z.boolean(),
  xpEarned: z.number().int().nonnegative(),
  hearts: z.number().int().nonnegative(),
  streak: streakStateSchema,
  levelUp: levelUpSchema.optional(),
  newAchievements: z.array(achievementSchema),
});

/* ------------------------------------------------------------------ */
/* Leaderboard                                                         */
/* ------------------------------------------------------------------ */

export const leaderboardTierSchema = z.enum([
  'bronze',
  'silver',
  'gold',
  'amethyst',
  'diamond',
]);

export const leaderboardEntrySchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  xp: z.number().int().nonnegative(),
  rank: z.number().int().positive(),
  tier: leaderboardTierSchema,
});

export const leaderboardSchema = z.object({
  tier: leaderboardTierSchema,
  endsAt: z.string(),
  currentUserId: z.string(),
  promotionZone: z.number().int().nonnegative(),
  demotionZone: z.number().int().nonnegative(),
  entries: z.array(leaderboardEntrySchema),
});

/* ------------------------------------------------------------------ */
/* Trading (paper only)                                                */
/* ------------------------------------------------------------------ */

export const holdingSchema = z.object({
  symbol: z.string(),
  quantity: z.number().nonnegative(),
  averageCost: z.number().nonnegative(),
  currentPrice: z.number().nonnegative(),
  value: z.number().nonnegative(),
  pnl: z.number(),
});

export const portfolioSchema = z.object({
  cash: z.number().nonnegative(),
  totalValue: z.number().nonnegative(),
  totalPnl: z.number(),
  holdings: z.array(holdingSchema),
  updatedAt: z.string(),
});

export const quoteSchema = z.object({
  symbol: z.string(),
  price: z.number().nonnegative(),
  change24h: z.number(),
  updatedAt: z.string(),
});

export const tradeSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  executedAt: z.string(),
});

export const placeTradeInputSchema = z.object({
  symbol: z.string(),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
});

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

export const problemDetailsSchema = z.object({
  type: z.string().optional(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  code: z.string().optional(),
});

/* ------------------------------------------------------------------ */
/* Inferred types                                                      */
/* ------------------------------------------------------------------ */

export type CharacterId = z.infer<typeof characterIdSchema>;
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;
export type LessonStatus = z.infer<typeof lessonStatusSchema>;
export type StreakState = z.infer<typeof streakStateSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type LearningModule = z.infer<typeof learningModuleSchema>;
export type LessonSummary = z.infer<typeof lessonSummarySchema>;
export type LessonProgress = z.infer<typeof lessonProgressSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];
export type Answer = z.infer<typeof answerSchema>;
export type AnswerKey = z.infer<typeof answerKeySchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type OfflineLesson = z.infer<typeof offlineLessonSchema>;
export type OfflinePack = z.infer<typeof offlinePackSchema>;
export type SubmittedAnswer = z.infer<typeof submittedAnswerSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptInputSchema>;
export type LevelUp = z.infer<typeof levelUpSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type AttemptResult = z.infer<typeof attemptResultSchema>;
export type LeaderboardTier = z.infer<typeof leaderboardTierSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type Leaderboard = z.infer<typeof leaderboardSchema>;
export type Holding = z.infer<typeof holdingSchema>;
export type Portfolio = z.infer<typeof portfolioSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type Trade = z.infer<typeof tradeSchema>;
export type PlaceTradeInput = z.infer<typeof placeTradeInputSchema>;
export type ProblemDetails = z.infer<typeof problemDetailsSchema>;

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
