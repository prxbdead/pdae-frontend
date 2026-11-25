import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useApi } from '@/api/ApiProvider';
import { CharacterArtwork } from '@/components/mascot/CharacterArtwork';
import { Badge, Card, Icon } from '@/components/ui';
import { ledgeColors, textVariants } from '@/theme/tokens';
import { useSafeInsets } from '@/theme/useSafeInsets';
import { useTheme } from '@/theme/useTheme';

export interface AuthScreenProps {
  /** Accessible name for the screen; shown as the back control label. */
  headerTitle: string;
  title: string;
  subtitle: string;
  onBack?(): void;
  children: ReactNode;
}

/**
 * Shared shell for every auth surface so the brand lockup, card spacing,
 * typography, and the demo badge never drift between screens.
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
  const { top, bottom } = useSafeInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        accessibilityLabel={headerTitle}
        contentContainerStyle={[
          styles.scroll,
          {
            gap: theme.spacing.lg,
            padding: theme.spacing.md,
            paddingBottom: theme.spacing.md + bottom,
            paddingTop: theme.spacing.md + top,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.column}>
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBack}
              style={styles.back}
            >
              <Icon name="arrow-left" color={theme.colors.text} size={22} />
            </Pressable>
          ) : null}

          <View style={[styles.brand, { gap: theme.spacing.xs }]}>
            <CharacterArtwork character="hodlo" size={96} />
            <Text
              accessibilityRole="header"
              style={[theme.typography.display, { color: theme.colors.primary }]}
            >
              Hodlo
            </Text>
            <Text
              style={[
                textVariants.overline,
                { color: theme.colors.textMuted },
              ]}
            >
              Crypto, minus the chaos
            </Text>
          </View>

          <Card style={{ gap: theme.spacing.md, padding: theme.spacing.lg }}>
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
              style={[
                theme.typography.body,
                styles.subtitle,
                { color: theme.colors.textMuted },
              ]}
            >
              {subtitle}
            </Text>

            {children}
          </Card>
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
          backgroundColor: theme.colors.dangerSoft,
          borderColor: ledgeColors.coral,
          borderRadius: theme.radii.md,
          padding: theme.spacing.sm,
        },
      ]}
    >
      <Text
        accessibilityRole="alert"
        style={[textVariants.bodyStrong, { color: theme.colors.text }]}
      >
        {message}
      </Text>
    </View>
  );
}

export function AuthDivider({ label }: { label: string }) {
  const theme = useTheme();

  return (
    <View style={styles.divider}>
      <View style={[styles.rule, { backgroundColor: theme.colors.border }]} />
      <Text style={[textVariants.label, { color: theme.colors.textMuted }]}>
        {label}
      </Text>
      <View style={[styles.rule, { backgroundColor: theme.colors.border }]} />
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  column: {
    gap: 24,
    maxWidth: 440,
    width: '100%',
  },
  back: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginBottom: -16,
    width: 44,
  },
  brand: {
    alignItems: 'center',
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
  subtitle: {
    marginTop: -8,
  },
  errorBanner: {
    borderWidth: 2,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  rule: {
    flex: 1,
    height: 2,
  },
  hint: {
    marginTop: -8,
    textAlign: 'center',
  },
});
