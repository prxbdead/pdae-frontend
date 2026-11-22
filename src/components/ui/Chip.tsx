import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?(): void;
  testID?: string;
}

export function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  testID,
}: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={[
        styles.chip,
        {
          borderRadius: theme.radii.pill,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          backgroundColor: selected
            ? theme.colors.secondary
            : theme.colors.surface,
        },
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          theme.typography.body,
          { color: selected ? theme.colors.onSecondary : theme.colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
