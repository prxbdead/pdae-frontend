import type { Answer } from '@/api/contracts';

export type LessonPhase = 'question' | 'feedback' | 'hearts_out' | 'complete';

export interface ExerciseResult {
  correct: boolean;
  firstTry: boolean;
}

export interface LessonSession {
  /**
   * Generated once per session and persisted with it, so finishing twice (a
   * double tap or a restored session) can never double-count XP.
   */
  clientAttemptId: string;
  lessonId: string;
  /** Every exercise in lesson order; used for scoring and progress. */
  exerciseIds: string[];
  /** Playback order; wrong answers are appended to the end exactly once. */
  queue: string[];
  index: number;
  answers: Record<string, Answer>;
  attempts: Record<string, number>;
  results: Record<string, ExerciseResult>;
  hearts: number;
  phase: LessonPhase;
  startedAt: number;
  requeued: string[];
}

export type LessonAction =
  | { type: 'answer'; exerciseId: string; answer: Answer }
  | { type: 'check'; exerciseId: string; correct: boolean }
  | { type: 'continue' }
  | { type: 'refill' }
  | { type: 'finish' };
