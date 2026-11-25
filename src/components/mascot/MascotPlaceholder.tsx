import { Pressable, StyleSheet, Text, View } from 'react-native';

import { contrastRatio } from '@/theme/contrast';
import { palette } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { CHARACTERS, type MascotProps } from './types';

const SIZES = { sm: 64, md: 120, lg: 200 } as const;
const INITIAL_SCALE = { sm: 28, md: 48, lg: 72 } as const;

function onFillColor(background: string): string {
  return contrastRatio(palette.white, background) >= contrastRatio(palette.plum, background)
    ? palette.white
    : palette.plum;
}

/**
 * Lightweight character stand-in used until the rigged 3D models are ready.
 * Compact instances render as a clean character token; larger instances also
 * show the guide's name and catchphrase.
 */
export function MascotPlaceholder({ character, mood, onPress, size = 'md' }: MascotProps) {
  const theme = useTheme();
  const meta = CHARACTERS[character];
  const dimension = SIZES[size];
  const fill = onFillColor(meta.color);

  const body = (
    <View style={styles.column}>
      <View style={[styles.tile, { width: dimension, height: dimension, backgroundColor: meta.color, borderColor: meta.accent }]}>
        <View style={[styles.eye, styles.leftEye]} />
        <View style={[styles.eye, styles.rightEye]} />
        <Text style={[styles.initial, { fontSize: INITIAL_SCALE[size], color: fill }]}>
          {meta.name.charAt(0)}
        </Text>
      </View>
      {size !== 'sm' ? (
        <>
          <Text style={[theme.typography.heading, styles.name, { color: theme.colors.text }]}>{meta.name}</Text>
          <Text style={[theme.typography.caption, styles.catchphrase, { color: theme.colors.textMuted }]}>{meta.catchphrase}</Text>
        </>
      ) : null}
    </View>
  );

  if (!onPress) {
    return <View accessibilityLabel={`${meta.name}, ${mood}`}>{body}</View>;
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${meta.name}, ${mood}`} onPress={onPress}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  column: { alignItems: 'center', gap: 8, alignSelf: 'center' },
  tile: { alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderRadius: 999, overflow: 'hidden' },
  eye: { position: 'absolute', top: '32%', width: 7, height: 7, borderRadius: 4, backgroundColor: palette.plum, opacity: 0.85 },
  leftEye: { left: '32%' },
  rightEye: { right: '32%' },
  initial: { fontWeight: '900', marginTop: 10 },
  name: { textAlign: 'center' },
  catchphrase: { textAlign: 'center', maxWidth: 240 },
});
