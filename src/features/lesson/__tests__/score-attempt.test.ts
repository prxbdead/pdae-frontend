import type { OfflineLesson } from '@/api/contracts';

import { createLessonSession, scoreAttempt } from '../engine';
import type { ExerciseResult, LessonSession } from '../types';

function makeLesson(count: number, xpReward = 40): OfflineLesson {
  return {
    id: 'test-lesson',
    moduleId: 'test-module',
    title: 'Test lesson',
    description: 'Fixture',
    order: 1,
    kind: 'lesson',
    xpReward,
    estimatedMinutes: 3,
    status: 'available',
    exercises: Array.from({ length: count }, (_, index) => ({
      id: `e${index}`,
      type: 'true_false' as const,
      prompt: `Prompt ${index}`,
      statement: 'Statement',
    })),
    answerKey: Object.fromEntries(
      Array.from({ length: count }, (_, index) => [
        `e${index}`,
        { type: 'true_false' as const, value: true },
      ]),
    ),
  };
}

function withResults(
  lesson: OfflineLesson,
  results: Record<string, ExerciseResult>,
  hearts = 5,
): LessonSession {
  const base = createLessonSession(lesson);

  return {
    ...base,
    hearts,
    results,
    answers: Object.fromEntries(
      lesson.exercises.map((exercise) => [
        exercise.id,
        { type: 'true_false' as const, value: true },
      ]),
    ),
    attempts: Object.fromEntries(
      lesson.exercises.map((exercise) => [exercise.id, 1]),
    ),
  };
}

function resultsFor(
  lesson: OfflineLesson,
  spec: ExerciseResult[],
): Record<string, ExerciseResult> {
  return Object.fromEntries(
    lesson.exercises.map((exercise, index) => [exercise.id, spec[index]]),
  );
}

describe('scoreAttempt', () => {
  it('passes 8 of 10 first-try correct at 80%', () => {
    const lesson = makeLesson(10);
    const results = resultsFor(lesson, [
      ...Array.from({ length: 8 }, () => ({ correct: true, firstTry: true })),
      ...Array.from({ length: 2 }, () => ({ correct: false, firstTry: false })),
    ]);
    const attempt = scoreAttempt(lesson, withResults(lesson, results));

    expect(attempt.score).toBe(0.8);
    expect(attempt.passed).toBe(true);
    expect(attempt.xpEarned).toBe(80);
  });

  it('fails 7 of 10', () => {
    const lesson = makeLesson(10);
    const results = resultsFor(lesson, [
      ...Array.from({ length: 7 }, () => ({ correct: true, firstTry: true })),
      ...Array.from({ length: 3 }, () => ({ correct: false, firstTry: false })),
    ]);
    const attempt = scoreAttempt(lesson, withResults(lesson, results));

    expect(attempt.score).toBe(0.7);
    expect(attempt.passed).toBe(false);
  });

  it('awards 100 XP plus a 10 XP perfect bonus', () => {
    const lesson = makeLesson(10);
    const results = resultsFor(
      lesson,
      Array.from({ length: 10 }, () => ({ correct: true, firstTry: true })),
    );

    expect(scoreAttempt(lesson, withResults(lesson, results)).xpEarned).toBe(
      110,
    );
  });

  it('does not award first-try XP for a requeued correction', () => {
    const lesson = makeLesson(10);
    const results = resultsFor(lesson, [
      ...Array.from({ length: 8 }, () => ({ correct: true, firstTry: true })),
      { correct: true, firstTry: false },
      { correct: false, firstTry: false },
    ]);
    const attempt = scoreAttempt(lesson, withResults(lesson, results));

    expect(attempt.score).toBe(0.8);
    expect(attempt.xpEarned).toBe(80);
    expect(attempt.mistakes).toEqual(['e8', 'e9']);
  });

  it('lists each wrong exercise once and records hearts lost', () => {
    const lesson = makeLesson(4);
    const results = resultsFor(lesson, [
      { correct: false, firstTry: false },
      { correct: true, firstTry: true },
      { correct: true, firstTry: false },
      { correct: true, firstTry: true },
    ]);
    const attempt = scoreAttempt(lesson, withResults(lesson, results, 2));

    expect(attempt.mistakes).toEqual(['e0', 'e2']);
    expect(attempt.heartsLost).toBe(3);
  });

  it('earns nothing for a practice lesson', () => {
    const lesson = makeLesson(4, 0);
    const results = resultsFor(
      lesson,
      Array.from({ length: 4 }, () => ({ correct: true, firstTry: true })),
    );

    expect(scoreAttempt(lesson, withResults(lesson, results)).xpEarned).toBe(0);
  });

  it('submits the latest answer per exercise', () => {
    const lesson = makeLesson(2);
    const results = resultsFor(lesson, [
      { correct: true, firstTry: true },
      { correct: false, firstTry: false },
    ]);
    const attempt = scoreAttempt(lesson, withResults(lesson, results));

    expect(attempt.answers).toHaveLength(2);
    expect(attempt.answers[0]).toEqual({
      exerciseId: 'e0',
      answer: { type: 'true_false', value: true },
      correct: true,
    });
    expect(attempt.clientAttemptId).toBe('test-uuid');
  });
});
