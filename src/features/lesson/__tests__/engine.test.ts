import type { OfflineLesson } from '@/api/contracts';

import { createLessonSession, lessonReducer } from '../engine';

function makeLesson(count: number): OfflineLesson {
  return {
    id: 'test-lesson',
    moduleId: 'test-module',
    title: 'Test lesson',
    description: 'Fixture',
    order: 1,
    kind: 'lesson',
    xpReward: 40,
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

describe('createLessonSession', () => {
  it('queues every exercise once in lesson order', () => {
    const session = createLessonSession(makeLesson(3));

    expect(session.queue).toEqual(['e0', 'e1', 'e2']);
    expect(session.exerciseIds).toEqual(['e0', 'e1', 'e2']);
    expect(session.index).toBe(0);
    expect(session.hearts).toBe(5);
    expect(session.phase).toBe('question');
  });

  it('reuses the scored attempt id for the whole session', () => {
    const session = createLessonSession(makeLesson(1));

    expect(session.clientAttemptId).toBe('test-uuid');
  });
});

describe('lessonReducer', () => {
  it('stores the selected answer without changing phase', () => {
    const session = lessonReducer(createLessonSession(makeLesson(2)), {
      type: 'answer',
      exerciseId: 'e0',
      answer: { type: 'true_false', value: true },
    });

    expect(session.answers.e0).toEqual({ type: 'true_false', value: true });
    expect(session.phase).toBe('question');
  });

  it('decrements hearts and requeues a wrong answer exactly once', () => {
    const start = createLessonSession(makeLesson(2));
    const first = lessonReducer(start, {
      type: 'check',
      exerciseId: 'e0',
      correct: false,
    });

    expect(first.hearts).toBe(4);
    expect(first.phase).toBe('feedback');
    expect(first.queue).toEqual(['e0', 'e1', 'e0']);
    expect(first.requeued).toEqual(['e0']);

    const second = lessonReducer(first, {
      type: 'check',
      exerciseId: 'e0',
      correct: false,
    });

    expect(second.queue).toEqual(['e0', 'e1', 'e0']);
    expect(second.hearts).toBe(3);
  });

  it('records first-try state per exercise', () => {
    const start = createLessonSession(makeLesson(2));
    const first = lessonReducer(start, {
      type: 'check',
      exerciseId: 'e0',
      correct: false,
    });
    const second = lessonReducer(first, {
      type: 'check',
      exerciseId: 'e0',
      correct: true,
    });

    expect(second.results.e0).toEqual({ correct: true, firstTry: false });
  });

  it('advances on continue and completes after the last queued exercise', () => {
    let session = createLessonSession(makeLesson(2));

    session = lessonReducer(session, {
      type: 'check',
      exerciseId: 'e0',
      correct: true,
    });
    session = lessonReducer(session, { type: 'continue' });

    expect(session.index).toBe(1);
    expect(session.phase).toBe('question');

    session = lessonReducer(session, {
      type: 'check',
      exerciseId: 'e1',
      correct: true,
    });
    session = lessonReducer(session, { type: 'continue' });

    expect(session.phase).toBe('complete');
  });

  it('enters hearts_out when the last heart is lost', () => {
    const start = {
      ...createLessonSession(makeLesson(2)),
      hearts: 1,
    };
    const checked = lessonReducer(start, {
      type: 'check',
      exerciseId: 'e0',
      correct: false,
    });
    const continued = lessonReducer(checked, { type: 'continue' });

    expect(continued.hearts).toBe(0);
    expect(continued.phase).toBe('hearts_out');
    expect(continued.index).toBe(0);
  });

  it('refills hearts and resumes on the next question', () => {
    const start = {
      ...createLessonSession(makeLesson(2)),
      hearts: 0,
      phase: 'hearts_out' as const,
    };
    const refilled = lessonReducer(start, { type: 'refill' });

    expect(refilled.hearts).toBe(5);
    expect(refilled.phase).toBe('question');
    expect(refilled.index).toBe(1);
  });

  it('finishes on demand', () => {
    const session = lessonReducer(createLessonSession(makeLesson(1)), {
      type: 'finish',
    });

    expect(session.phase).toBe('complete');
  });
});
