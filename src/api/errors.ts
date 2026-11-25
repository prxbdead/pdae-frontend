import type { ProblemDetails } from './contracts';

/**
 * Normalized API failure. `status` is the HTTP status, or 0 for network and
 * timeout failures so callers can distinguish "offline" from a rejected request.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    options?: { code?: string; details?: unknown },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
  }

  static fromProblemDetails(
    problem: ProblemDetails,
    details?: unknown,
  ): ApiError {
    return new ApiError(
      problem.detail ?? problem.title,
      problem.status,
      { code: problem.code, details },
    );
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isAuthError(): boolean {
    return this.status === 401;
  }
}
