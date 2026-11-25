import { useCallback, useMemo, useState } from 'react';

import type { Schema } from '@/api/schema';

type Field<T> = keyof T & string;

/**
 * Form state driven by a schema. A field shows its first error once the user
 * has changed or left it, and submit only runs when the whole form is valid.
 */
export function useSchemaForm<T extends Record<string, unknown>>(
  schema: Schema<T>,
  defaults: T,
) {
  const [values, setValues] = useState<T>(defaults);
  const [touched, setTouched] = useState<Partial<Record<Field<T>, true>>>({});

  const result = useMemo(() => schema.safeParse(values), [schema, values]);

  const errors = useMemo(() => {
    const out: Partial<Record<Field<T>, string>> = {};

    if (result.success) {
      return out;
    }

    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if (typeof field === 'string' && touched[field as Field<T>] && !out[field as Field<T>]) {
        out[field as Field<T>] = issue.message;
      }
    }

    return out;
  }, [result, touched]);

  const setField = useCallback(<K extends Field<T>>(name: K, value: T[K]) => {
    setValues((current) => ({ ...current, [name]: value }));
    setTouched((current) => ({ ...current, [name]: true }));
  }, []);

  const blurField = useCallback((name: Field<T>) => {
    setTouched((current) => ({ ...current, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    (onValid: (submitted: T) => Promise<void>) => async () => {
      const allTouched = Object.fromEntries(
        Object.keys(defaults).map((key) => [key, true]),
      ) as Partial<Record<Field<T>, true>>;

      setTouched(allTouched);

      const current = schema.safeParse(values);

      if (current.success) {
        await onValid(current.data);
      }
    },
    [defaults, schema, values],
  );

  return {
    values,
    errors,
    isValid: result.success,
    setField,
    blurField,
    handleSubmit,
  };
}
