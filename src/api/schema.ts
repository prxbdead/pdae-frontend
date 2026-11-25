/**
 * Runtime validation for API payloads and form input.
 *
 * Replaces zod. Metro, the web bundler, does not tree-shake, so any zod import
 * pulled its full core and every locale into the startup chunk (about 90 KiB
 * gzipped). This module implements only the constructs the app uses, with the
 * same function names as zod/mini so call sites stay readable.
 */

export type PathKey = string | number;

export interface Issue {
  readonly path: readonly PathKey[];
  readonly message: string;
}

export class SchemaError extends Error {
  readonly issues: readonly Issue[];

  constructor(issues: readonly Issue[]) {
    super(issues[0]?.message ?? 'Invalid value');
    this.name = 'SchemaError';
    this.issues = issues;
  }
}

type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly issues: readonly Issue[] };

type Run<T> = (input: unknown, path: readonly PathKey[]) => Result<T>;

export type SafeParseResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: SchemaError };

/** A rule applied after a schema accepts the value. */
export interface Check<T> {
  readonly message: string;
  readonly path?: readonly PathKey[];
  test(value: T): boolean;
}

const success = <T>(value: T): Result<T> => ({ ok: true, value });

const failure = (path: readonly PathKey[], message: string): Result<never> => ({
  ok: false,
  issues: [{ path, message }],
});

function isPlainObject(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

export class Schema<T> {
  constructor(readonly run: Run<T>) {}

  parse(input: unknown): T {
    const result = this.run(input, []);

    if (!result.ok) {
      throw new SchemaError(result.issues);
    }

    return result.value;
  }

  safeParse(input: unknown): SafeParseResult<T> {
    const result = this.run(input, []);

    return result.ok
      ? { success: true, data: result.value }
      : { success: false, error: new SchemaError(result.issues) };
  }

  optional(): OptionalSchema<T> {
    return new OptionalSchema<T>((input, path) =>
      input === undefined ? success(undefined) : this.run(input, path),
    );
  }

  nullable(): Schema<T | null> {
    return new Schema<T | null>((input, path) =>
      input === null ? success(null) : this.run(input, path),
    );
  }

  check(...checks: Check<T>[]): Schema<T> {
    return new Schema<T>((input, path) => {
      const result = this.run(input, path);

      if (!result.ok) {
        return result;
      }

      for (const check of checks) {
        if (!check.test(result.value)) {
          return {
            ok: false,
            issues: [
              { path: [...path, ...(check.path ?? [])], message: check.message },
            ],
          };
        }
      }

      return result;
    });
  }
}

/** Marks a field as optional so object output types can drop its key. */
export class OptionalSchema<T> extends Schema<T | undefined> {
  readonly isOptional = true as const;
}

export type Infer<S> = S extends { parse(input: unknown): infer T } ? T : never;

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function string(): Schema<string> {
  return new Schema<string>((input, path) =>
    typeof input === 'string' ? success(input) : failure(path, 'Expected a string'),
  );
}

export function number(): Schema<number> {
  return new Schema<number>((input, path) =>
    typeof input === 'number' && Number.isFinite(input)
      ? success(input)
      : failure(path, 'Expected a number'),
  );
}

export function boolean(): Schema<boolean> {
  return new Schema<boolean>((input, path) =>
    typeof input === 'boolean' ? success(input) : failure(path, 'Expected a boolean'),
  );
}

export function literal<const T extends string | number | boolean>(
  value: T,
): Schema<T> {
  return new Schema<T>((input, path) =>
    input === value ? success(value) : failure(path, `Expected ${JSON.stringify(value)}`),
  );
}

export function enumOf<const T extends readonly string[]>(
  values: T,
): Schema<T[number]> {
  return new Schema<T[number]>((input, path) =>
    typeof input === 'string' && (values as readonly string[]).includes(input)
      ? success(input as T[number])
      : failure(path, `Expected one of ${values.join(', ')}`),
  );
}

export function array<T>(item: Schema<T>): Schema<T[]> {
  return new Schema<T[]>((input, path) => {
    if (!Array.isArray(input)) {
      return failure(path, 'Expected an array');
    }

    const out: T[] = [];
    const issues: Issue[] = [];

    input.forEach((element, index) => {
      const result = item.run(element, [...path, index]);

      if (result.ok) {
        out.push(result.value);
      } else {
        issues.push(...result.issues);
      }
    });

    return issues.length > 0 ? { ok: false, issues } : success(out);
  });
}

export function record<T>(key: Schema<string>, value: Schema<T>): Schema<Record<string, T>> {
  return new Schema<Record<string, T>>((input, path) => {
    if (!isPlainObject(input)) {
      return failure(path, 'Expected an object');
    }

    const out: Record<string, T> = {};
    const issues: Issue[] = [];

    for (const [entryKey, entryValue] of Object.entries(input)) {
      const keyResult = key.run(entryKey, path);
      const valueResult = value.run(entryValue, [...path, entryKey]);

      if (!keyResult.ok) {
        issues.push(...keyResult.issues);
      }

      if (valueResult.ok) {
        out[entryKey] = valueResult.value;
      } else {
        issues.push(...valueResult.issues);
      }
    }

    return issues.length > 0 ? { ok: false, issues } : success(out);
  });
}

/* ------------------------------------------------------------------ */
/* Objects                                                             */
/* ------------------------------------------------------------------ */

export type Shape = { readonly [key: string]: Schema<unknown> };

type OptionalKeys<S> = {
  [K in keyof S]: S[K] extends { readonly isOptional: true } ? K : never;
}[keyof S];

type Simplify<T> = { [K in keyof T]: T[K] };

export type ObjectOutput<S> = Simplify<
  { [K in Exclude<keyof S, OptionalKeys<S>>]: Infer<S[K]> } & {
    [K in OptionalKeys<S>]?: Infer<S[K]>;
  }
>;

export class ObjectSchema<S extends Shape> extends Schema<ObjectOutput<S>> {
  constructor(readonly shape: S) {
    super((input, path) => {
      if (!isPlainObject(input)) {
        return failure(path, 'Expected an object');
      }

      const out: Record<string, unknown> = {};
      const issues: Issue[] = [];

      for (const key of Object.keys(shape)) {
        const result = shape[key].run(input[key], [...path, key]);

        if (!result.ok) {
          issues.push(...result.issues);
        } else if (result.value !== undefined || key in input) {
          out[key] = result.value;
        }
      }

      return issues.length > 0
        ? { ok: false, issues }
        : success(out as ObjectOutput<S>);
    });
  }
}

export function object<S extends Shape>(shape: S): ObjectSchema<S> {
  return new ObjectSchema(shape);
}

export function extend<S extends Shape, E extends Shape>(
  base: ObjectSchema<S>,
  extra: E,
): ObjectSchema<S & E> {
  return object({ ...base.shape, ...extra });
}

export function discriminatedUnion<const V extends readonly ObjectSchema<Shape>[]>(
  key: string,
  variants: V,
): Schema<Infer<V[number]>> {
  return new Schema<Infer<V[number]>>((input, path) => {
    if (!isPlainObject(input)) {
      return failure(path, 'Expected an object');
    }

    for (const variant of variants) {
      const discriminator = variant.shape[key];

      if (discriminator && discriminator.safeParse(input[key]).success) {
        return variant.run(input, path) as Result<Infer<V[number]>>;
      }
    }

    return failure([...path, key], 'Invalid discriminator value');
  });
}

export function optional<T>(schema: Schema<T>): OptionalSchema<T> {
  return schema.optional();
}

export function nullable<T>(schema: Schema<T>): Schema<T | null> {
  return schema.nullable();
}

export function parse<T>(schema: Schema<T>, input: unknown): T {
  return schema.parse(input);
}

export function safeParse<T>(schema: Schema<T>, input: unknown): SafeParseResult<T> {
  return schema.safeParse(input);
}

/* ------------------------------------------------------------------ */
/* Checks                                                              */
/* ------------------------------------------------------------------ */

export function minLength(min: number, message?: string): Check<{ length: number }> {
  return {
    message: message ?? `Must have at least ${min} characters or items`,
    test: (value) => value.length >= min,
  };
}

export function maxLength(max: number, message?: string): Check<{ length: number }> {
  return {
    message: message ?? `Must have at most ${max} characters or items`,
    test: (value) => value.length <= max,
  };
}

export function gte(min: number, message?: string): Check<number> {
  return { message: message ?? `Must be at least ${min}`, test: (value) => value >= min };
}

export function lte(max: number, message?: string): Check<number> {
  return { message: message ?? `Must be at most ${max}`, test: (value) => value <= max };
}

export function positive(message = 'Must be greater than 0'): Check<number> {
  return { message, test: (value) => value > 0 };
}

export function nonnegative(message = 'Must be 0 or greater'): Check<number> {
  return { message, test: (value) => value >= 0 };
}

export function email(message = 'Invalid email address'): Check<string> {
  return { message, test: (value) => EMAIL_PATTERN.test(value) };
}

export function int(): Schema<number> {
  return number().check({
    message: 'Expected an integer',
    test: (value) => Number.isInteger(value),
  });
}

export function refine<T>(
  test: (value: T) => boolean,
  params: string | { message: string; path?: readonly PathKey[] },
): Check<T> {
  const { message, path } = typeof params === 'string' ? { message: params, path: undefined } : params;

  return { message, path, test };
}

/** Accepts any JSON value, used for responses with no body to check. */
export function unknown(): Schema<unknown> {
  return new Schema<unknown>((input) => success(input));
}
