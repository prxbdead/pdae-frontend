import { StyleSheet, Text, View } from 'react-native';

import {
  avatarColor,
  avatarInitials,
  avatarTextColor,
} from '@/features/profile/avatar';
import { useTheme } from '@/theme/useTheme';

export interface AvatarProps {
  /** Stable id; the same id always gets the same color. */
  id: string;
  name: string;
  size?: number;
  testID?: string;
}

/** Initials on a deterministic palette color, until the avatar builder ships. */
export function Avatar({ id, name, size = 40, testID }: AvatarProps) {
  const theme = useTheme();
  const typography =
    size >= 56 ? theme.typography.title : theme.typography.body;

  return (
    <View
      testID={testID}
      style={[
        styles.avatar,
        {
          backgroundColor: avatarColor(id),
          borderRadius: theme.radii.pill,
          height: size,
          width: size,
        },
      ]}
    >
      <Text
        style={[
          typography,
          styles.initials,
          { color: avatarTextColor(id) },
        ]}
      >
        {avatarInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'Nunito_900Black',
    fontWeight: '900',
  },
});
