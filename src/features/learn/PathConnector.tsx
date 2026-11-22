import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

/** Decorative dashed line behind the nodes; never intercepts touches. */
export function PathConnector() {
  const theme = useTheme();

  return (
    <View
      pointerEvents="none"
      style={[styles.line, { borderColor: theme.colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    bottom: 0,
    left: '50%',
    position: 'absolute',
    top: 0,
  },
});
