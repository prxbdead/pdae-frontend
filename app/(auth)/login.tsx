import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useApi } from '@/api/ApiProvider';
import { ApiError } from '@/api/errors';
import { useSessionStore } from '@/auth/sessionStore';
import { AuthDivider, AuthError, AuthScreen } from '@/auth/AuthScreen';
import { loginFormSchema } from '@/auth/validation';
import { useSchemaForm } from '@/auth/useSchemaForm';
import { Button, TextField } from '@/components/ui';

export default function LoginScreen() {
  const router = useRouter();
  const { client } = useApi();
  const signIn = useSessionStore((state) => state.signIn);
  const consumeReturnTo = useSessionStore((state) => state.consumeReturnTo);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { values, errors, isValid, setField, blurField, handleSubmit } =
    useSchemaForm(loginFormSchema, { email: '', password: '' });

  const onSubmit = handleSubmit(async (submitted) => {
    setApiError(null);
    setSubmitting(true);

    try {
      const user = await client.auth.login(submitted);

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

      <TextField
        label="Email"
        testID="login-email"
        value={values.email}
        onChangeText={(text) => setField('email', text)}
        onBlur={() => blurField('email')}
        error={errors.email}
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        inputMode="email"
      />

      <TextField
        label="Password"
        testID="login-password"
        value={values.password}
        onChangeText={(text) => setField('password', text)}
        onBlur={() => blurField('password')}
        error={errors.password}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
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
