import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '@/assets/icons';
import { CharacterArtwork } from '@/components/mascot/CharacterArtwork';
import type { CharacterId } from '@/types/domain';
import { useTheme } from '@/theme/useTheme';

import { Button } from './Button';
import { Icon } from './Icon';

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: IconName;
  /** Shows a Hodlo character instead of an icon for friendlier moments. */
  character?: CharacterId;
  actionLabel?: string;
  onAction?(): void;
  testID?: string;
}

export function EmptyState({
  title,
  message,
  icon = 'search',
  character,
  actionLabel,
  onAction,
  testID,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        { gap: theme.spacing.sm, padding: theme.spacing.lg },
      ]}
    >
      <View
        style={[
          styles.art,
          {
            backgroundColor: theme.colors.primarySoft,
            borderRadius: theme.radii.lg,
          },
        ]}
      >
        {character ? (
          <CharacterArtwork character={character} size={96} />
        ) : (
          <Icon name={icon} color={theme.colors.textMuted} size={72} />
        )}
      </View>
      <Text
        accessibilityRole="header"
        style={[
          theme.typography.heading,
          styles.centered,
          { color: theme.colors.text },
        ]}
      >
        {title}
      </Text>
      {message ? (
        <Text
          style={[
            theme.typography.body,
            styles.centered,
            styles.message,
            { color: theme.colors.textMuted },
          ]}
        >
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: theme.spacing.xs }}>
          <Button label={actionLabel} onPress={onAction} size="sm" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  art: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 128,
    width: 128,
  },
  centered: {
    textAlign: 'center',
  },
  message: {
    maxWidth: 320,
  },
});
