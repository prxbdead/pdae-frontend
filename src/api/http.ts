import { z, type ZodType } from 'zod';

import {
  achievementSchema,
  attemptResultSchema,
  leaderboardSchema,
  lessonProgressSchema,
  lessonSchema,
  lessonSummarySchema,
  learningModuleSchema,
  offlinePackSchema,
  portfolioSchema,
  problemDetailsSchema,
  quoteSchema,
  tradeSchema,
  userProfileSchema,
  type ApiClient,
  type LoginInput,
  type PlaceTradeInput,
  type RegisterInput,
  type SubmitAttemptInput,
  type UpdateProfileInput,
} from './contracts';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';
import { ApiError } from './errors';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  idempotencyKey?: string;
};

function timezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export class HttpApiClient implements ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(
    path: string,
    schema: ZodType<T>,
    options: RequestOptions = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      let response: Response;

      try {
        response = await fetch(`${this.baseUrl}${path}`, {
          method: options.method ?? 'GET',
          credentials: 'include',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            ...(options.body === undefined
              ? {}
              : { 'Content-Type': 'application/json' }),
            'X-Timezone': timezone(),
            ...(options.idempotencyKey
              ? { 'Idempotency-Key': options.idempotencyKey }
              : {}),
          },
          ...(options.body === undefined
            ? {}
            : { body: JSON.stringify(options.body) }),
        });
      } catch (error) {
        throw new ApiError(
          error instanceof Error ? error.message : 'Network request failed',
          0,
          { code: 'network_error' },
        );
      }

      const text = await response.text();

      if (!response.ok) {
        throw this.toApiError(text, response.status);
      }

      const payload = text ? this.parseJson(text, response.status) : undefined;

      return schema.parse(payload);
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseJson(text: string, status: number): unknown {
    try {
      return JSON.parse(text);
    } catch {
      throw new ApiError('Malformed JSON response', status, {
        code: 'invalid_json',
      });
    }
  }

  private toApiError(text: string, status: number): ApiError {
    const parsed = problemDetailsSchema.safeParse(
      (() => {
        try {
          return JSON.parse(text);
        } catch {
          return undefined;
        }
      })(),
    );

    if (parsed.success) {
      return ApiError.fromProblemDetails(parsed.data);
    }

    return new ApiError(text || `Request failed with ${status}`, status);
  }

  auth = {
    register: (input: RegisterInput) =>
      this.request('/auth/register', userProfileSchema, {
        method: 'POST',
        body: input,
      }),
    login: (input: LoginInput) =>
      this.request('/auth/login', userProfileSchema, {
        method: 'POST',
        body: input,
      }),
    logout: async () => {
      await this.request('/auth/logout', z.unknown(), { method: 'POST' });
    },
    me: () => this.request('/users/me', userProfileSchema),
  };

  profile = {
    update: (input: UpdateProfileInput) =>
      this.request('/users/me', userProfileSchema, {
        method: 'PATCH',
        body: input,
      }),
    deleteAccount: async () => {
      await this.request('/users/me', z.unknown(), { method: 'DELETE' });
    },
  };

  content = {
    listModules: () =>
      this.request('/content/modules', learningModuleSchema.array()),
    listLessons: (moduleId: string) =>
      this.request(
        `/content/modules/${encodeURIComponent(moduleId)}/lessons`,
        lessonSummarySchema.array(),
      ),
    getLesson: (lessonId: string) =>
      this.request(
        `/content/lessons/${encodeURIComponent(lessonId)}`,
        lessonSchema,
      ),
    getOfflinePack: (version?: string) =>
      this.request(
        version
          ? `/content/pack?version=${encodeURIComponent(version)}`
          : '/content/pack',
        offlinePackSchema,
      ),
  };

  progress = {
    getProgress: () =>
      this.request('/users/me/progress', lessonProgressSchema.array()),
  };

  attempts = {
    submit: (input: SubmitAttemptInput, clientAttemptId: string) =>
      this.request('/attempts', attemptResultSchema, {
        method: 'POST',
        body: input,
        idempotencyKey: clientAttemptId,
      }),
  };

  leaderboard = {
    getWeekly: () => this.request('/leaderboard/weekly', leaderboardSchema),
  };

  achievements = {
    list: () => this.request('/achievements', achievementSchema.array()),
  };

  trading = {
    getPortfolio: () => this.request('/trading/portfolio', portfolioSchema),
    getQuotes: (symbols: string[]) =>
      this.request(
        `/trading/quotes?symbols=${encodeURIComponent(symbols.join(','))}`,
        quoteSchema.array(),
      ),
    placeTrade: (input: PlaceTradeInput, clientTradeId: string) =>
      this.request('/trading/trades', tradeSchema, {
        method: 'POST',
        body: input,
        idempotencyKey: clientTradeId,
      }),
  };
}
