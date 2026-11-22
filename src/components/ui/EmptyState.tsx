import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '@/assets/icons';
import { useTheme } from '@/theme/useTheme';

import { Button } from './Button';
import { Icon } from './Icon';

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?(): void;
  testID?: string;
}

export function EmptyState({
  title,
  message,
  icon = 'search',
  actionLabel,
  onAction,
  testID,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View testID={testID} style={styles.container}>
      <View
        style={[
          styles.iconTile,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radii.lg,
          },
        ]}
      >
        <Icon name={icon} color={theme.colors.textMuted} size={32} />
      </View>
      <Text
        style={[
          theme.typography.heading,
          styles.title,
          { color: theme.colors.text },
        ]}
      >
        {title}
      </Text>
      {message ? (
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} size="sm" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  iconTile: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
});
