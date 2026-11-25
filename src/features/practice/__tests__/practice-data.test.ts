import { mockPack } from '@/content/fixtures/pack';

import {
  buildMistakesLesson,
  buildPracticeItems,
  selectPracticeLesson,
} from '../usePracticeData';

describe('selectPracticeLesson', () => {
  it.each([
    ['chart', 'price-action-1', 'chip'],
    ['scam', 'safety-1', 'vex'],
    ['risk', 'risk-1', 'grizz'],
    ['dca', 'investing-1', 'tank'],
  ] as const)(
    'picks the first %s drill lesson from %s',
    (kind, lessonId, teacher) => {
      const lesson = selectPracticeLesson(mockPack, kind);

      expect(lesson?.id).toBe(lessonId);

      const module = mockPack.modules.find(
        (entry) => entry.id === lesson?.moduleId,
      );

      expect(module?.teacherCharacterId).toBe(teacher);
    },
  );
});

describe('buildMistakesLesson', () => {
  it('keeps only the requested exercises, in pack order', () => {
    const lesson = buildMistakesLesson(mockPack, [
      'price-action-1-e1',
      'foundations-1-e2',
      'missing-exercise',
    ]);

    expect(lesson).toMatchObject({
      id: 'practice-mistakes',
      title: 'Mistakes review',
      xpReward: 0,
    });
    expect(lesson?.exercises.map((exercise) => exercise.id)).toEqual([
      'foundations-1-e2',
      'price-action-1-e1',
    ]);
    expect(Object.keys(lesson?.answerKey ?? {}).sort()).toEqual([
      'foundations-1-e2',
      'price-action-1-e1',
    ]);
  });

  it('copies each answer from its source lesson', () => {
    const lesson = buildMistakesLesson(mockPack, ['foundations-1-e1']);
    const source = mockPack.lessons.find(
      (entry) => entry.id === 'foundations-1',
    );

    expect(lesson?.answerKey['foundations-1-e1']).toEqual(
      source?.answerKey['foundations-1-e1'],
    );
  });

  it('deduplicates repeated exercise ids', () => {
    const lesson = buildMistakesLesson(mockPack, [
      'foundations-1-e1',
      'foundations-1-e1',
    ]);

    expect(lesson?.exercises).toHaveLength(1);
  });

  it('returns null when there is nothing to review', () => {
    expect(buildMistakesLesson(mockPack, [])).toBeNull();
    expect(buildMistakesLesson(mockPack, ['not-an-exercise'])).toBeNull();
  });
});

describe('buildPracticeItems', () => {
  it('builds seven unique cards that link to real routes', () => {
    const items = buildPracticeItems(mockPack, [
      'foundations-1-e1',
      'foundations-1-e2',
    ]);

    expect(items).toHaveLength(7);
    expect(new Set(items.map((item) => item.kind)).size).toBe(7);

    for (const item of items) {
      expect(item.href).toMatch(/^\/(lesson|practice)\/|^\/glossary$/);
    }
  });

  it('wires drills to their teacher lessons and trading to the portfolio', () => {
    const items = buildPracticeItems(mockPack, []);
    const byKind = Object.fromEntries(
      items.map((item) => [item.kind, item] as const),
    );

    expect(byKind.chart.href).toBe('/lesson/price-action-1');
    expect(byKind.scam.href).toBe('/lesson/safety-1');
    expect(byKind.risk.href).toBe('/lesson/risk-1');
    expect(byKind.dca.href).toBe('/lesson/investing-1');
    expect(byKind.trading.href).toBe('/practice/trading');
    expect(byKind.trading.badge).toBe('Virtual money');
    expect(byKind.flashcards.disabled).toBe(true);
  });

  it('counts mistakes and disables the review when there are none', () => {
    const withMistakes = buildPracticeItems(mockPack, [
      'foundations-1-e1',
      'foundations-1-e2',
    ]);
    const withoutMistakes = buildPracticeItems(mockPack, []);

    expect(withMistakes[0]).toMatchObject({
      kind: 'mistakes',
      badge: '2 to review',
      disabled: false,
    });
    expect(withoutMistakes[0]).toMatchObject({
      kind: 'mistakes',
      badge: 'No mistakes yet',
      disabled: true,
    });
  });
});
