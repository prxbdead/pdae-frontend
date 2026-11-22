import { mockPack } from '@/content/fixtures/pack';

import { EXERCISE_TYPES, lessonSchema, offlinePackSchema } from '../contracts';

describe('content contract', () => {
  it('parses the bundled pack', () => {
    const pack = offlinePackSchema.parse(mockPack);

    expect(pack.modules).toHaveLength(5);
    expect(pack.lessons).toHaveLength(10);

    for (const module of pack.modules) {
      expect(pack.lessons.filter((l) => l.moduleId === module.id)).toHaveLength(
        2,
      );
    }
  });

  it('covers every exercise type', () => {
    const pack = offlinePackSchema.parse(mockPack);
    const present = new Set(
      pack.lessons.flatMap((lesson) =>
        lesson.exercises.map((exercise) => exercise.type),
      ),
    );

    for (const type of EXERCISE_TYPES) {
      expect(present.has(type)).toBe(true);
    }
  });

  it('has an answer key entry for every exercise', () => {
    const pack = offlinePackSchema.parse(mockPack);

    for (const lesson of pack.lessons) {
      for (const exercise of lesson.exercises) {
        expect(lesson.answerKey[exercise.id]).toBeDefined();
      }
    }
  });

  it('keeps answer keys out of the online lesson shape', () => {
    const pack = offlinePackSchema.parse(mockPack);
    const offline = pack.lessons[0];
    const { answerKey, ...online } = offline;

    expect(Object.keys(answerKey).length).toBeGreaterThan(0);

    const parsed = lessonSchema.parse(online);

    expect('answerKey' in parsed).toBe(false);
    expect(parsed.exercises).toHaveLength(offline.exercises.length);
  });
});
