import rawPack from '../packs/hodlo-pack-v1.json';

describe('bundled content pack', () => {
  it.each(rawPack.lessons.map((lesson) => [lesson.id, lesson] as const))(
    '%s has 8-12 prompts, each with an answer key entry',
    (_id, lesson) => {
      expect(lesson.exercises.length).toBeGreaterThanOrEqual(8);
      expect(lesson.exercises.length).toBeLessThanOrEqual(12);
      for (const exercise of lesson.exercises) {
        expect(lesson.answerKey).toHaveProperty([exercise.id]);
      }
    },
  );
});
