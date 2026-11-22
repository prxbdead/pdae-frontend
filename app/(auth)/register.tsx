import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApi } from '@/api/ApiProvider';
import { ApiError } from '@/api/errors';
import { useSessionStore } from '@/auth/sessionStore';
import {
  AuthDivider,
  AuthError,
  AuthScreen,
} from '@/auth/AuthScreen';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '@/auth/validation';
import { Button, Icon, TextField } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { client } = useApi();
  const signIn = useSessionStore((state) => state.signIn);
  const consumeReturnTo = useSessionStore((state) => state.consumeReturnTo);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onChange',
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const canSubmit = isValid && termsAccepted;

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    setSubmitting(true);

    try {
      const user = await client.auth.register({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
      });

      await signIn(user);
      router.replace(consumeReturnTo() ?? '/(tabs)/learn');
    } catch (error) {
      setApiError(
        error instanceof ApiError
          ? error.message
          : 'Could not create the account. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthScreen
      headerTitle="Create account"
      title="Join Hodlo"
      subtitle="Create a profile so your progress follows you."
      onBack={() => router.replace('/login')}
    >
      {apiError ? <AuthError message={apiError} /> : null}

      <Controller
        control={control}
        name="displayName"
        render={({ field }) => (
          <TextField
            label="Display name"
            testID="register-display-name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.displayName?.message}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            label="Email"
            testID="register-email"
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
            testID="register-password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <TextField
            label="Confirm password"
            testID="register-confirm"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.confirmPassword?.message}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
        )}
      />

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: termsAccepted }}
        accessibilityLabel="Accept the terms and disclaimer"
        testID="register-terms"
        onPress={() => setTermsAccepted((value) => !value)}
        style={styles.termsRow}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: termsAccepted
                ? theme.colors.primary
                : theme.colors.surface,
              borderColor: termsAccepted
                ? theme.colors.primary
                : theme.colors.border,
              borderRadius: theme.radii.sm,
            },
          ]}
        >
          {termsAccepted ? (
            <Icon name="check" color={theme.colors.onPrimary} size={16} />
          ) : null}
        </View>
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted, flex: 1 },
          ]}
        >
          I agree to the terms and the financial-education disclaimer.
        </Text>
      </Pressable>

      <Button
        label="Create account"
        testID="register-submit"
        onPress={() => void onSubmit()}
        disabled={!canSubmit}
        loading={submitting}
        fullWidth
      />

      <AuthDivider label="Already have an account?" />

      <Button
        label="Log in"
        testID="register-login-link"
        variant="secondary"
        onPress={() => router.replace('/login')}
        fullWidth
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  termsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  checkbox: {
    alignItems: 'center',
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
});
