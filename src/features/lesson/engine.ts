import { randomUUID } from 'expo-crypto';

import type { OfflineLesson, SubmittedAnswer } from '@/api/contracts';
import { xpForScore } from '@/features/gamification/xp';
import type { LocalAttemptResult } from '@/offline/types';

import type { LessonAction, LessonSession } from './types';

export const DEFAULT_HEARTS = 5;
export const PASS_SCORE = 0.8;

export function createLessonSession(
  lesson: OfflineLesson,
  hearts: number = DEFAULT_HEARTS,
): LessonSession {
  const exerciseIds = lesson.exercises.map((exercise) => exercise.id);

  return {
    clientAttemptId: randomUUID(),
    lessonId: lesson.id,
    exerciseIds,
    queue: [...exerciseIds],
    index: 0,
    answers: {},
    attempts: {},
    results: {},
    hearts,
    phase: 'question',
    startedAt: Date.now(),
    requeued: [],
  };
}

export function lessonReducer(
  state: LessonSession,
  action: LessonAction,
): LessonSession {
  switch (action.type) {
    case 'answer':
      return {
        ...state,
        answers: { ...state.answers, [action.exerciseId]: action.answer },
      };

    case 'check': {
      const alreadyRequeued = state.requeued.includes(action.exerciseId);
      const shouldRequeue = !action.correct && !alreadyRequeued;

      return {
        ...state,
        attempts: {
          ...state.attempts,
          [action.exerciseId]: (state.attempts[action.exerciseId] ?? 0) + 1,
        },
        results: {
          ...state.results,
          [action.exerciseId]: {
            correct: action.correct,
            firstTry: (state.attempts[action.exerciseId] ?? 0) === 0,
          },
        },
        hearts: action.correct
          ? state.hearts
          : Math.max(0, state.hearts - 1),
        queue: shouldRequeue
          ? [...state.queue, action.exerciseId]
          : state.queue,
        requeued: shouldRequeue
          ? [...state.requeued, action.exerciseId]
          : state.requeued,
        phase: 'feedback',
      };
    }

    case 'continue':
      if (state.hearts <= 0) {
        return { ...state, phase: 'hearts_out' };
      }

      if (state.index + 1 >= state.queue.length) {
        return { ...state, phase: 'complete' };
      }

      return { ...state, index: state.index + 1, phase: 'question' };

    case 'refill':
      // Losing the last heart already answered the current question, so a
      // refill resumes at the next one instead of repeating the same prompt.
      if (state.index + 1 >= state.queue.length) {
        return { ...state, hearts: DEFAULT_HEARTS, phase: 'complete' };
      }

      return {
        ...state,
        hearts: DEFAULT_HEARTS,
        index: state.index + 1,
        phase: 'question',
      };

    case 'finish':
      return { ...state, phase: 'complete' };

    default:
      return state;
  }
}

/**
 * The score only counts exercises answered correctly on the first attempt, so
 * a re-queued correction can never raise it. Mistakes keep every exercise the
 * learner got wrong at least once.
 */
export function scoreAttempt(
  lesson: OfflineLesson,
  session: LessonSession,
  now: number = Date.now(),
): LocalAttemptResult {
  const total = lesson.exercises.length;
  const correct = lesson.exercises.filter((exercise) => {
    const result = session.results[exercise.id];

    return result?.correct === true && result.firstTry;
  }).length;

  const score = total === 0 ? 0 : correct / total;
  const passed = score >= PASS_SCORE;
  const xpEarned = xpForScore(score, total, lesson.xpReward);

  const mistakes = lesson.exercises
    .filter((exercise) => {
      const result = session.results[exercise.id];

      return result !== undefined && !(result.correct && result.firstTry);
    })
    .map((exercise) => exercise.id);

  const answers: SubmittedAnswer[] = lesson.exercises.flatMap((exercise) => {
    const answer = session.answers[exercise.id];
    const result = session.results[exercise.id];

    if (!answer || !result) {
      return [];
    }

    return [{ exerciseId: exercise.id, answer, correct: result.correct }];
  });

  return {
    clientAttemptId: session.clientAttemptId,
    lessonId: lesson.id,
    startedAt: new Date(session.startedAt).toISOString(),
    completedAt: new Date(now).toISOString(),
    answers,
    score,
    passed,
    xpEarned,
    heartsLost: Math.max(0, DEFAULT_HEARTS - session.hearts),
    mistakes,
  };
}
