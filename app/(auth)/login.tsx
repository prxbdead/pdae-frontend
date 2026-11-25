import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useApi } from '@/api/ApiProvider';
import { ApiError } from '@/api/errors';
import { useSessionStore } from '@/auth/sessionStore';
import { AuthDivider, AuthError, AuthScreen } from '@/auth/AuthScreen';
import {
  loginFormSchema,
  type LoginFormValues,
} from '@/auth/validation';
import { Button, TextField } from '@/components/ui';

export default function LoginScreen() {
  const router = useRouter();
  const { client } = useApi();
  const signIn = useSessionStore((state) => state.signIn);
  const consumeReturnTo = useSessionStore((state) => state.consumeReturnTo);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    setSubmitting(true);

    try {
      const user = await client.auth.login(values);

      await signIn(user);
      router.replace(consumeReturnTo() ?? '/(tabs)/learn');
    } catch (error) {
      setApiError(
        error instanceof ApiError
          ? error.message
          : 'Could not sign in. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthScreen
      headerTitle="Log in"
      title="Welcome back"
      subtitle="Pick up where you left off."
    >
      {apiError ? <AuthError message={apiError} /> : null}

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            label="Email"
            testID="login-email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            inputMode="email"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            label="Password"
            testID="login-password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
          />
        )}
      />

      <Button
        label="Log in"
        testID="login-submit"
        onPress={() => void onSubmit()}
        disabled={!isValid}
        loading={submitting}
        fullWidth
      />

      <AuthDivider label="New to Hodlo?" />

      <Button
        label="Create account"
        testID="create-account"
        variant="contrast"
        onPress={() => router.push('/register')}
        fullWidth
      />


    </AuthScreen>
  );
}
