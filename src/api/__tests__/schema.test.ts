import * as z from '../schema';

describe('schema primitives', () => {
  it('accepts matching values and rejects the wrong type', () => {
    expect(z.string().parse('abc')).toBe('abc');
    expect(() => z.string().parse(1)).toThrow('Expected a string');
    expect(z.number().parse(2.5)).toBe(2.5);
    expect(() => z.number().parse(Number.NaN)).toThrow('Expected a number');
    expect(z.boolean().parse(false)).toBe(false);
    expect(() => z.boolean().parse('false')).toThrow('Expected a boolean');
  });

  it('checks integers and ranges with their messages', () => {
    expect(z.int().parse(3)).toBe(3);
    expect(() => z.int().parse(3.5)).toThrow('Expected an integer');
    expect(() => z.int().check(z.nonnegative()).parse(-1)).toThrow(
      'Must be 0 or greater',
    );
    expect(() => z.number().check(z.gte(0), z.lte(1)).parse(1.5)).toThrow(
      'Must be at most 1',
    );
  });

  it('checks string and array lengths', () => {
    const name = z.string().check(z.minLength(1), z.maxLength(3));

    expect(() => name.parse('')).toThrow();
    expect(() => name.parse('abcd')).toThrow();
    expect(
      z.array(z.number()).check(z.minLength(2)).safeParse([1]).success,
    ).toBe(false);
  });

  it('reports enum and literal mismatches', () => {
    const side = z.enumOf(['buy', 'sell'] as const);

    expect(side.parse('buy')).toBe('buy');
    expect(() => side.parse('hold')).toThrow('Expected one of buy, sell');
    expect(z.literal('x').parse('x')).toBe('x');
    expect(() => z.literal('x').parse('y')).toThrow('Expected "x"');
  });
});

describe('schema objects', () => {
  const profile = z.object({
    name: z.string(),
    nickname: z.optional(z.string()),
    score: z.nullable(z.number()),
  });

  it('strips unknown keys and omits absent optional keys', () => {
    const parsed = profile.parse({ name: 'a', score: null, extra: true });

    expect(parsed).toEqual({ name: 'a', score: null });
    expect('nickname' in parsed).toBe(false);
  });

  it('reports the path of a nested failure', () => {
    const result = profile.safeParse({ name: 1, score: 0 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual([
        { path: ['name'], message: 'Expected a string' },
      ]);
    }
  });

  it('extends an object with more fields', () => {
    const extended = z.extend(profile, { rank: z.int() });

    expect(extended.parse({ name: 'a', score: 1, rank: 2 })).toEqual({
      name: 'a',
      score: 1,
      rank: 2,
    });
    expect(extended.safeParse({ name: 'a', score: 1 }).success).toBe(false);
  });

  it('applies refinements at a chosen path', () => {
    const pair = z
      .object({ password: z.string(), confirm: z.string() })
      .check(
        z.refine<{ password: string; confirm: string }>(
          (value) => value.password === value.confirm,
          { path: ['confirm'], message: 'Passwords do not match' },
        ),
      );

    const result = pair.safeParse({ password: 'a', confirm: 'b' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual([
        { path: ['confirm'], message: 'Passwords do not match' },
      ]);
    }
  });
});

describe('schema unions and records', () => {
  it('selects the variant whose discriminator matches', () => {
    const shape = z.discriminatedUnion('type', [
      z.object({ type: z.literal('a'), value: z.number() }),
      z.object({ type: z.literal('b'), label: z.string() }),
    ]);

    expect(shape.parse({ type: 'b', label: 'x' })).toEqual({
      type: 'b',
      label: 'x',
    });
    expect(shape.safeParse({ type: 'c' }).success).toBe(false);
  });

  it('validates every record value', () => {
    const counts = z.record(z.string(), z.int());

    expect(counts.parse({ a: 1 })).toEqual({ a: 1 });
    expect(counts.safeParse({ a: 1.5 }).success).toBe(false);
  });
});
