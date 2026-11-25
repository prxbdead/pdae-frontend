import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApi } from '@/api/ApiProvider';
import { ApiError } from '@/api/errors';
import { useSessionStore } from '@/auth/sessionStore';
import {
  AuthDivider,
  AuthError,
  AuthScreen,
} from '@/auth/AuthScreen';
import { registerFormSchema } from '@/auth/validation';
import { useSchemaForm } from '@/auth/useSchemaForm';
import { ICONS } from '@/assets/icons';
import { Button, TextField } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

const CheckMark = ICONS.check;

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { client } = useApi();
  const signIn = useSessionStore((state) => state.signIn);
  const consumeReturnTo = useSessionStore((state) => state.consumeReturnTo);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { values, errors, isValid, setField, blurField, handleSubmit } =
    useSchemaForm(registerFormSchema, {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    });

  const canSubmit = isValid && termsAccepted;

  const onSubmit = handleSubmit(async (submitted) => {
    setApiError(null);
    setSubmitting(true);

    try {
      const user = await client.auth.register({
        displayName: submitted.displayName,
        email: submitted.email,
        password: submitted.password,
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

      <TextField
        label="Display name"
        testID="register-display-name"
        value={values.displayName}
        onChangeText={(text) => setField('displayName', text)}
        onBlur={() => blurField('displayName')}
        error={errors.displayName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />

      <TextField
        label="Email"
        testID="register-email"
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
        testID="register-password"
        value={values.password}
        onChangeText={(text) => setField('password', text)}
        onBlur={() => blurField('password')}
        error={errors.password}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <TextField
        label="Confirm password"
        testID="register-confirm"
        value={values.confirmPassword}
        onChangeText={(text) => setField('confirmPassword', text)}
        onBlur={() => blurField('confirmPassword')}
        error={errors.confirmPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
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
            <CheckMark color={theme.colors.onPrimary} size={16} />
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
        variant="contrast"
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
    gap: 12,
    minHeight: 44,
  },
  checkbox: {
    alignItems: 'center',
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
});
