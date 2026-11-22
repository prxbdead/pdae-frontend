import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useApi } from '@/api/ApiProvider';
import { Badge, PageHeader } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

export interface AuthScreenProps {
  headerTitle: string;
  title: string;
  subtitle: string;
  onBack?(): void;
  children: ReactNode;
}

/**
 * Shared shell for every auth surface so headers, card spacing, typography,
 * and the demo badge never drift between screens.
 */
export function AuthScreen({
  headerTitle,
  title,
  subtitle,
  onBack,
  children,
}: AuthScreenProps) {
  const theme = useTheme();
  const { mode } = useApi();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
    >
      <PageHeader title={headerTitle} tier="compact" onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
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
              style={[
                theme.typography.title,
                styles.title,
                { color: theme.colors.text },
              ]}
            >
              {title}
            </Text>
            {mode === 'mock' ? <Badge label="Demo mode" tone="lilac" /> : null}
          </View>

          <Text
            style={[theme.typography.body, { color: theme.colors.textMuted }]}
          >
            {subtitle}
          </Text>

          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function AuthError({ message }: { message: string }) {
  const theme = useTheme();

  return (
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
        {message}
      </Text>
    </View>
  );
}

export function AuthDivider({ label }: { label: string }) {
  const theme = useTheme();

  return (
    <View
      style={[styles.divider, { borderTopColor: theme.colors.border }]}
    >
      <Text
        style={[theme.typography.caption, { color: theme.colors.textMuted }]}
      >
        {label}
      </Text>
    </View>
  );
}

export function AuthHint({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <Text
      style={[
        theme.typography.caption,
        styles.hint,
        { color: theme.colors.textMuted },
      ]}
    >
      {children}
    </Text>
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
    gap: 12,
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
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
