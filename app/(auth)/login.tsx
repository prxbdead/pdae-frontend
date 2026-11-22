import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useApi } from '@/api/ApiProvider';
import { ApiError } from '@/api/errors';
import { useSessionStore } from '@/auth/sessionStore';
import {
  loginFormSchema,
  type LoginFormValues,
} from '@/auth/validation';
import { Badge, Button, PageHeader, TextField } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { client, mode } = useApi();
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
    >
      <PageHeader title="Log in" tier="compact" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.lg,
            },
          ]}
        >
          <View style={styles.titleRow}>
            <Text
              style={[theme.typography.title, { color: theme.colors.text }]}
            >
              Welcome back
            </Text>
            {mode === 'mock' ? <Badge label="Demo mode" tone="lilac" /> : null}
          </View>

          <Text
            style={[theme.typography.body, { color: theme.colors.textMuted }]}
          >
            Pick up where you left off.
          </Text>

          {apiError ? (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderColor: theme.colors.danger,
                  borderRadius: theme.radii.sm,
                },
              ]}
            >
              <Text
                accessibilityRole="alert"
                style={[theme.typography.body, { color: theme.colors.danger }]}
              >
                {apiError}
              </Text>
            </View>
          ) : null}

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

          <View
            style={[styles.divider, { borderTopColor: theme.colors.border }]}
          >
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textMuted },
              ]}
            >
              New to Hodlo?
            </Text>
          </View>

          <Button
            label="Create account"
            testID="create-account"
            variant="secondary"
            onPress={() => router.push('/register')}
            fullWidth
          />

          <Button
            label="Start onboarding"
            testID="start-onboarding"
            variant="ghost"
            onPress={() => router.push('/onboarding')}
            fullWidth
          />

          <Text
            style={[
              theme.typography.caption,
              styles.hint,
              { color: theme.colors.textMuted },
            ]}
          >
            Set up your profile first — you create the account at the end.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    alignItems: 'center',
    padding: 24,
  },
  card: {
    borderWidth: 1,
    gap: 16,
    maxWidth: 440,
    padding: 24,
    width: '100%',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorBanner: {
    borderWidth: 1,
    padding: 12,
  },
  divider: {
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 16,
  },
  hint: {
    marginTop: -8,
    textAlign: 'center',
  },
});
