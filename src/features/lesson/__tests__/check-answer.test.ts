import type { Answer, Exercise, OfflineLesson } from '@/api/contracts';
import { mockPack } from '@/content/fixtures/pack';

import {
  checkAnswer,
  describeAnswer,
  isAnswerReady,
} from '../checkAnswer';

function fixture(exerciseId: string): {
  lesson: OfflineLesson;
  exercise: Exercise;
  key: Answer;
} {
  for (const lesson of mockPack.lessons) {
    const exercise = lesson.exercises.find((entry) => entry.id === exerciseId);

    if (exercise) {
      const key = lesson.answerKey[exerciseId];

      if (!key) {
        throw new Error(`Missing answer key for ${exerciseId}`);
      }

      return { lesson, exercise, key };
    }
  }

  throw new Error(`Missing exercise ${exerciseId}`);
}

function grade(exerciseId: string, answer: Answer): boolean {
  const { lesson, exercise } = fixture(exerciseId);

  return checkAnswer(exercise, answer, lesson.answerKey).correct;
}

describe('checkAnswer', () => {
  it('matches a multiple choice option id', () => {
    expect(grade('foundations-1-e1', { type: 'multiple_choice', optionId: 'a' })).toBe(true);
    expect(grade('foundations-1-e1', { type: 'multiple_choice', optionId: 'b' })).toBe(false);
  });

  it('matches a true/false boolean', () => {
    expect(grade('foundations-1-e2', { type: 'true_false', value: false })).toBe(true);
    expect(grade('foundations-1-e2', { type: 'true_false', value: true })).toBe(false);
  });

  it('trims and case-folds fill-in-the-blank answers', () => {
    expect(
      grade('foundations-1-e3', {
        type: 'fill_blank',
        values: [' Wallet ', 'KEY'],
      }),
    ).toBe(true);
    expect(
      grade('foundations-1-e3', {
        type: 'fill_blank',
        values: ['wallet', 'address'],
      }),
    ).toBe(false);
  });

  it('compares matched pairs unordered', () => {
    expect(
      grade('foundations-1-e4', {
        type: 'match_pairs',
        pairs: [
          { left: 'l2', right: 'r2' },
          { left: 'l1', right: 'r1' },
        ],
      }),
    ).toBe(true);
    expect(
      grade('foundations-1-e4', {
        type: 'match_pairs',
        pairs: [
          { left: 'l1', right: 'r2' },
          { left: 'l2', right: 'r1' },
        ],
      }),
    ).toBe(false);
  });

  it('requires the exact step order', () => {
    expect(
      grade('foundations-2-e2', {
        type: 'order_steps',
        stepIds: ['s1', 's2', 's3'],
      }),
    ).toBe(true);
    expect(
      grade('foundations-2-e2', {
        type: 'order_steps',
        stepIds: ['s2', 's1', 's3'],
      }),
    ).toBe(false);
  });

  it('matches chart and story option ids', () => {
    expect(grade('price-action-1-e1', { type: 'read_chart', optionId: 'c2' })).toBe(true);
    expect(grade('foundations-2-e4', { type: 'story_card', optionId: 'b' })).toBe(true);
    expect(grade('foundations-2-e4', { type: 'story_card', optionId: 'a' })).toBe(false);
  });

  it('compares scam hotspots as an unordered set', () => {
    expect(
      grade('safety-1-e1', {
        type: 'spot_scam',
        hotspotIds: ['h3', 'h1', 'h2'],
      }),
    ).toBe(true);
    expect(
      grade('safety-1-e1', {
        type: 'spot_scam',
        hotspotIds: ['h1', 'h2'],
      }),
    ).toBe(false);
  });

  it('allows a small tolerance on position size', () => {
    expect(
      grade('investing-1-e3', {
        type: 'risk_calculator',
        positionSize: 200.005,
      }),
    ).toBe(true);
    expect(
      grade('investing-1-e3', {
        type: 'risk_calculator',
        positionSize: 200.02,
      }),
    ).toBe(false);
  });

  it('matches the DCA action', () => {
    expect(grade('investing-1-e1', { type: 'dca_timeline', action: 'buy' })).toBe(true);
    expect(grade('investing-1-e1', { type: 'dca_timeline', action: 'sell' })).toBe(false);
  });

  it('returns the explanation and the correct answer', () => {
    const { lesson, exercise } = fixture('foundations-1-e2');
    const result = checkAnswer(
      exercise,
      { type: 'true_false', value: true },
      lesson.answerKey,
    );

    expect(result.explanation).toContain('payments');
    expect(result.correctAnswer).toEqual({ type: 'true_false', value: false });
  });

  it('fails safely when an answer does not match its exercise', () => {
    const { lesson, exercise } = fixture('foundations-1-e1');

    expect(
      checkAnswer(
        exercise,
        { type: 'true_false', value: true },
        lesson.answerKey,
      ).correct,
    ).toBe(false);
  });
});

describe('isAnswerReady', () => {
  it('accepts a complete single choice and rejects a missing one', () => {
    const { exercise } = fixture('foundations-1-e1');

    expect(isAnswerReady(exercise, undefined)).toBe(false);
    expect(
      isAnswerReady(exercise, { type: 'multiple_choice', optionId: 'a' }),
    ).toBe(true);
  });

  it('requires every blank to be filled', () => {
    const { exercise } = fixture('foundations-1-e3');

    expect(
      isAnswerReady(exercise, { type: 'fill_blank', values: ['wallet'] }),
    ).toBe(false);
    expect(
      isAnswerReady(exercise, {
        type: 'fill_blank',
        values: ['wallet', 'key'],
      }),
    ).toBe(true);
  });

  it('rejects a zero position size', () => {
    const { exercise } = fixture('investing-1-e3');

    expect(
      isAnswerReady(exercise, { type: 'risk_calculator', positionSize: 0 }),
    ).toBe(false);
  });
});

describe('describeAnswer', () => {
  it('renders the option text for a choice', () => {
    const { exercise, key } = fixture('foundations-1-e1');

    expect(describeAnswer(exercise, key)).toBe(
      'A shared ledger that many computers keep in sync',
    );
  });

  it('renders true/false as words', () => {
    const { exercise, key } = fixture('foundations-1-e2');

    expect(describeAnswer(exercise, key)).toBe('False');
  });
});
