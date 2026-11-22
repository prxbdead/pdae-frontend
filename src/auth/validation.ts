import { z } from 'zod';

const email = z.string().min(1, 'Enter a valid email').email('Enter a valid email');

export const loginFormSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const registerFormSchema = z
  .object({
    displayName: z
      .string()
      .min(1, 'Enter a display name')
      .max(40, 'Use 40 characters or fewer'),
    email,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    terms: z.boolean().optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
