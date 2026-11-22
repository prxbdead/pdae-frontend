import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  testID?: string;
}

export function Skeleton({
  width = '100%',
  height = 16,
  radius,
  testID,
}: SkeletonProps) {
  const theme = useTheme();

  return (
    <View
      testID={testID ?? 'skeleton'}
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.block,
        {
          width,
          height,
          borderRadius: radius ?? theme.radii.sm,
          backgroundColor: theme.colors.surfaceAlt,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    opacity: 0.7,
  },
});
