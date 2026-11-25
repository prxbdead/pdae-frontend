import { mockPack } from '../fixtures/pack';
import { offlinePackSchema } from '../schema';

function clone() {
  return JSON.parse(JSON.stringify(mockPack));
}

describe('offlinePackSchema', () => {
  it('accepts the bundled pack fixture', () => {
    expect(() => offlinePackSchema.parse(mockPack)).not.toThrow();
  });

  it('rejects an unknown exercise type', () => {
    const pack = clone();
    pack.lessons[0].exercises[0].type = 'interpret_dreams';

    const result = offlinePackSchema.safeParse(pack);

    expect(result.success).toBe(false);
  });

  it('rejects an exercise missing its prompt', () => {
    const pack = clone();
    delete pack.lessons[0].exercises[0].prompt;

    expect(offlinePackSchema.safeParse(pack).success).toBe(false);
  });

  it('rejects a malformed answer key entry', () => {
    const pack = clone();
    pack.lessons[0].answerKey = { broken: { type: 'multiple_choice' } };

    expect(offlinePackSchema.safeParse(pack).success).toBe(false);
  });

  it('rejects a module with an unknown teacher', () => {
    const pack = clone();
    pack.modules[0].teacherCharacterId = 'nobody';

    expect(offlinePackSchema.safeParse(pack).success).toBe(false);
  });
});
