import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';
import { CharacterArtwork } from './CharacterArtwork';
import { CHARACTERS, type MascotProps } from './types';

const SIZES = { sm: 64, md: 120, lg: 200 } as const;

/**
 * App-ready character artwork used until the rigged 3D models are ready.
 * The public Mascot component remains the single swap point for that work.
 */
export function MascotPlaceholder({ character, mood, onPress, size = 'md' }: MascotProps) {
  const theme = useTheme();
  const meta = CHARACTERS[character];
  const dimension = SIZES[size];

  const body = (
    <View style={styles.column}>
      <CharacterArtwork character={character} size={dimension} />
      {size !== 'sm' ? (
        <>
          <Text style={[theme.typography.heading, styles.name, { color: theme.colors.text }]}>{meta.name}</Text>
          <Text style={[theme.typography.caption, styles.catchphrase, { color: theme.colors.textMuted }]}>{meta.catchphrase}</Text>
        </>
      ) : null}
    </View>
  );

  if (!onPress) return <View accessible accessibilityLabel={`${meta.name}, ${mood}`}>{body}</View>;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${meta.name}, ${mood}`} onPress={onPress}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  column: { alignItems: 'center', gap: 8, alignSelf: 'center' },
  name: { textAlign: 'center' },
  catchphrase: { textAlign: 'center', maxWidth: 240 },
});
