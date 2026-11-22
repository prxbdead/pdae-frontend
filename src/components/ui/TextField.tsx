import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  testID?: string;
}

export function TextField({
  label,
  error,
  testID,
  secureTextEntry = false,
  accessibilityLabel,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(true);
  const isPassword = secureTextEntry;

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          theme.typography.caption,
          styles.label,
          { color: theme.colors.textMuted },
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radii.sm,
          },
        ]}
      >
        <TextInput
          {...inputProps}
          testID={testID}
          accessibilityLabel={accessibilityLabel ?? label}
          secureTextEntry={isPassword ? hidden : false}
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.input,
            theme.typography.body,
            { color: theme.colors.text },
          ]}
        />

        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            onPress={() => setHidden((value) => !value)}
            hitSlop={8}
          >
            <Text
              style={[
                theme.typography.caption,
                styles.toggle,
                { color: theme.colors.primary },
              ]}
            >
              {hidden ? 'Show' : 'Hide'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text
          accessibilityRole="alert"
          style={[theme.typography.caption, { color: theme.colors.danger }]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontWeight: '700',
  },
  inputRow: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  toggle: {
    fontWeight: '700',
    marginLeft: 8,
  },
});
