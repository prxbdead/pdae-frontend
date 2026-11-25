import * as z from '@/api/schema';

const EMAIL_HINT = 'Enter a valid email';

const email = z
  .string()
  .check(z.minLength(1, EMAIL_HINT), z.email(EMAIL_HINT));

export const loginFormSchema = z.object({
  email,
  password: z.string().check(z.minLength(1, 'Password is required')),
});

export const registerFormSchema = z
  .object({
    displayName: z.string().check(
      z.minLength(1, 'Enter a display name'),
      z.maxLength(40, 'Use 40 characters or fewer'),
    ),
    email,
    password: z
      .string()
      .check(z.minLength(8, 'Password must be at least 8 characters')),
    confirmPassword: z.string().check(z.minLength(1, 'Confirm your password')),
    terms: z.optional(z.boolean()),
  })
  .check(
    z.refine<{ password: string; confirmPassword: string }>(
      (values) => values.password === values.confirmPassword,
      { path: ['confirmPassword'], message: 'Passwords do not match' },
    ),
  );

export type LoginFormValues = z.Infer<typeof loginFormSchema>;
export type RegisterFormValues = z.Infer<typeof registerFormSchema>;
