import { mockPack } from '@/content/fixtures/pack';

import type {
  ApiClient,
  AttemptResult,
  LearningModule,
  Lesson,
  LessonProgress,
  LessonSummary,
  LoginInput,
  OfflinePack,
  Portfolio,
  RegisterInput,
  SubmitAttemptInput,
  Trade,
  UpdateProfileInput,
  UserProfile,
} from './contracts';
import { ApiError } from './errors';
import {
  mockAchievements,
  mockLeaderboard,
  mockPortfolio,
  mockQuotes,
  mockUser,
} from './fixtures';

const LATENCY_MS = process.env.NODE_ENV === 'test' ? 0 : 150;

function delay(): Promise<void> {
  return LATENCY_MS > 0
    ? new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
    : Promise.resolve();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stripLesson(lesson: Lesson & { answerKey?: unknown }): Lesson {
  const online: Lesson & { answerKey?: unknown } = { ...lesson };
  delete online.answerKey;

  return online;
}

function toSummary(lesson: Lesson): LessonSummary {
  return {
    id: lesson.id,
    moduleId: lesson.moduleId,
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    kind: lesson.kind,
    xpReward: lesson.xpReward,
    estimatedMinutes: lesson.estimatedMinutes,
    status: lesson.status,
    ...(lesson.bestScore === undefined
      ? {}
      : { bestScore: lesson.bestScore }),
  };
}

/**
 * In-memory implementation of the contract. It keeps just enough state to make
 * idempotency and profile updates observable; content comes from the bundled
 * fixture pack.
 */
function round(value: number, digits: number): number {
  return Number(value.toFixed(digits));
}

export class MockApiClient implements ApiClient {
  private currentUser: UserProfile | null = null;
  private readonly attemptsByClientId = new Map<string, AttemptResult>();
  private readonly tradesByClientId = new Map<string, Trade>();
  private readonly progressByLesson = new Map<string, LessonProgress>();
  private portfolio: Portfolio = clone(mockPortfolio);

  reset(): void {
    this.currentUser = null;
    this.attemptsByClientId.clear();
    this.tradesByClientId.clear();
    this.progressByLesson.clear();
    this.portfolio = clone(mockPortfolio);
  }

  private requireUser(): UserProfile {
    if (!this.currentUser) {
      throw new ApiError('Not authenticated', 401, { code: 'unauthenticated' });
    }

    return this.currentUser;
  }

  auth = {
    register: async (input: RegisterInput): Promise<UserProfile> => {
      await delay();
      this.currentUser = {
        ...clone(mockUser),
        id: `user-${Date.now()}`,
        email: input.email,
        displayName: input.displayName,
      };

      return clone(this.currentUser);
    },
    login: async (_input: LoginInput): Promise<UserProfile> => {
      await delay();
      this.currentUser = clone(mockUser);

      return clone(this.currentUser);
    },
    logout: async (): Promise<void> => {
      await delay();
      this.currentUser = null;
    },
    me: async (): Promise<UserProfile> => {
      await delay();

      return clone(this.requireUser());
    },
  };

  profile = {
    update: async (input: UpdateProfileInput): Promise<UserProfile> => {
      await delay();
      const user = this.requireUser();
      this.currentUser = { ...user, ...input };

      return clone(this.currentUser);
    },
    deleteAccount: async (): Promise<void> => {
      await delay();
      this.requireUser();

      throw new ApiError(
        'Account deletion is not supported by the backend yet',
        501,
        { code: 'not_implemented' },
      );
    },
  };

  content = {
    listModules: async (): Promise<LearningModule[]> => {
      await delay();

      return clone(mockPack.modules);
    },
    listLessons: async (moduleId: string): Promise<LessonSummary[]> => {
      await delay();

      return mockPack.lessons
        .filter((lesson) => lesson.moduleId === moduleId)
        .map((lesson) => toSummary(lesson));
    },
    getLesson: async (lessonId: string): Promise<Lesson> => {
      await delay();
      const lesson = mockPack.lessons.find((entry) => entry.id === lessonId);

      if (!lesson) {
        throw new ApiError('Lesson not found', 404, { code: 'not_found' });
      }

      return clone(stripLesson(lesson));
    },
    getOfflinePack: async (): Promise<OfflinePack> => {
      await delay();

      return clone(mockPack);
    },
  };

  progress = {
    getProgress: async (): Promise<LessonProgress[]> => {
      await delay();

      return Array.from(this.progressByLesson.values()).map((entry) => ({
        ...entry,
      }));
    },
  };

  attempts = {
    submit: async (
      input: SubmitAttemptInput,
      clientAttemptId: string,
    ): Promise<AttemptResult> => {
      await delay();

      const existing = this.attemptsByClientId.get(clientAttemptId);
      if (existing) {
        return clone(existing);
      }

      const user = this.requireUser();
      const streak = {
        ...user.streak,
        current: Math.max(1, user.streak.current),
        longest: Math.max(user.streak.longest, 1),
        lastLessonDate: input.completedAt.slice(0, 10),
      };

      const result: AttemptResult = {
        attemptId: `attempt-${this.attemptsByClientId.size + 1}`,
        clientAttemptId,
        lessonId: input.lessonId,
        score: input.score,
        passed: input.passed,
        xpEarned: input.xpEarned,
        hearts: Math.max(0, user.hearts - input.heartsLost),
        streak,
        newAchievements: [],
      };

      this.attemptsByClientId.set(clientAttemptId, result);
      this.currentUser = {
        ...user,
        xp: user.xp + input.xpEarned,
        hearts: result.hearts,
        streak,
      };

      const previous = this.progressByLesson.get(input.lessonId);
      this.progressByLesson.set(input.lessonId, {
        lessonId: input.lessonId,
        status: input.passed ? 'completed' : 'in_progress',
        bestScore: Math.max(previous?.bestScore ?? 0, input.score),
        attempts: (previous?.attempts ?? 0) + 1,
      });

      return clone(result);
    },
  };

  leaderboard = {
    getWeekly: async () => {
      await delay();

      return clone(mockLeaderboard);
    },
  };

  achievements = {
    list: async () => {
      await delay();

      return clone(mockAchievements);
    },
  };

  trading = {
    getPortfolio: async () => {
      await delay();

      return clone(this.portfolio);
    },
    getQuotes: async (symbols: string[]) => {
      await delay();

      if (symbols.length === 0) {
        return clone(mockQuotes);
      }

      return clone(
        mockQuotes.filter((quote) => symbols.includes(quote.symbol)),
      );
    },
    placeTrade: async (
      input: { symbol: string; side: 'buy' | 'sell'; quantity: number },
      clientTradeId: string,
    ): Promise<Trade> => {
      await delay();

      if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
        throw new ApiError('Quantity must be greater than zero', 400, {
          code: 'invalid_quantity',
        });
      }

      const existing = this.tradesByClientId.get(clientTradeId);
      if (existing) {
        return clone(existing);
      }

      this.requireUser();
      const quote = mockQuotes.find((entry) => entry.symbol === input.symbol);

      if (!quote) {
        throw new ApiError('Unknown symbol', 404, { code: 'not_found' });
      }

      const cost = input.quantity * quote.price;
      const holding = this.portfolio.holdings.find(
        (entry) => entry.symbol === input.symbol,
      );

      if (input.side === 'buy' && cost > this.portfolio.cash + 0.000001) {
        throw new ApiError('Insufficient virtual cash', 422, {
          code: 'insufficient_funds',
        });
      }

      if (
        input.side === 'sell' &&
        input.quantity > (holding?.quantity ?? 0) + 0.000001
      ) {
        throw new ApiError('Not enough of that asset to sell', 422, {
          code: 'insufficient_holdings',
        });
      }

      if (input.side === 'buy') {
        this.portfolio.cash = round(this.portfolio.cash - cost, 2);

        if (holding) {
          const nextQuantity = round(holding.quantity + input.quantity, 8);
          holding.averageCost = round(
            (holding.quantity * holding.averageCost + cost) / nextQuantity,
            2,
          );
          holding.quantity = nextQuantity;
        } else {
          this.portfolio.holdings.push({
            symbol: input.symbol,
            quantity: round(input.quantity, 8),
            averageCost: quote.price,
            currentPrice: quote.price,
            value: round(cost, 2),
            pnl: 0,
          });
        }
      } else {
        this.portfolio.cash = round(this.portfolio.cash + cost, 2);

        if (holding) {
          holding.quantity = round(holding.quantity - input.quantity, 8);

          if (holding.quantity <= 0.000001) {
            this.portfolio.holdings = this.portfolio.holdings.filter(
              (entry) => entry.symbol !== input.symbol,
            );
          }
        }
      }

      for (const entry of this.portfolio.holdings) {
        entry.currentPrice = entry.symbol === input.symbol
          ? quote.price
          : (mockQuotes.find((item) => item.symbol === entry.symbol)?.price ??
            entry.currentPrice);
        entry.value = round(entry.quantity * entry.currentPrice, 2);
        entry.pnl = round(
          (entry.currentPrice - entry.averageCost) * entry.quantity,
          2,
        );
      }

      this.portfolio.totalValue = round(
        this.portfolio.cash +
          this.portfolio.holdings.reduce((sum, entry) => sum + entry.value, 0),
        2,
      );
      this.portfolio.totalPnl = round(
        this.portfolio.holdings.reduce((sum, entry) => sum + entry.pnl, 0),
        2,
      );
      this.portfolio.updatedAt = new Date().toISOString();

      const trade: Trade = {
        id: `trade-${this.tradesByClientId.size + 1}`,
        symbol: input.symbol,
        side: input.side,
        quantity: input.quantity,
        price: quote.price,
        executedAt: this.portfolio.updatedAt,
      };

      this.tradesByClientId.set(clientTradeId, trade);

      return clone(trade);
    },
  };
}

let activeMock: MockApiClient | null = null;

export function setActiveMock(client: MockApiClient): void {
  activeMock = client;
}

/** Clears the state of the most recently created mock client. */
export function resetMockApi(): void {
  activeMock?.reset();
}
