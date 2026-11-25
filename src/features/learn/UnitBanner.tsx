import type { LearningModule } from '@/api/contracts';
import { Mascot } from '@/components/mascot/Mascot';
import { CHARACTERS } from '@/components/mascot/types';
import { Icon, ProgressRing } from '@/components/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { contrastRatio } from '@/theme/contrast';
import { ledgeColors, palette } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

function onFill(background: string): string {
  return contrastRatio(palette.white, background) >= contrastRatio(palette.plum, background)
    ? palette.white
    : palette.plum;
}

const ACCENTS: Record<LearningModule['accent'], { fill: string; ledge: string }> = {
  purple: { fill: palette.purple, ledge: ledgeColors.purple },
  mint: { fill: palette.mint, ledge: ledgeColors.mint },
  yellow: { fill: palette.yellow, ledge: ledgeColors.yellow },
  coral: { fill: palette.coral, ledge: ledgeColors.coral },
  lilac: { fill: palette.lilac, ledge: ledgeColors.lilac },
};

export interface UnitBannerProps {
  module: LearningModule;
  completed: number;
  total: number;
  onJumpToUnit?(): void;
}

export function UnitBanner({ module, completed, total, onJumpToUnit }: UnitBannerProps) {
  const theme = useTheme();
  const teacher = CHARACTERS[module.teacherCharacterId];
  const accent = ACCENTS[module.accent] ?? ACCENTS.purple;
  const ink = onFill(accent.fill);
  const progress = total > 0 ? completed / total : 0;

  return (
    <View
      accessible
      accessibilityLabel={`Unit ${module.unitNumber}: ${module.title}, taught by ${teacher.name}`}
      testID={`unit-banner-${module.id}`}
      style={[styles.ledge, { backgroundColor: accent.ledge, borderRadius: theme.radii.lg }]}
    >
      <View style={[styles.band, { backgroundColor: accent.fill, borderRadius: theme.radii.lg }]}>
        <View style={styles.row}>
          <View style={styles.text}>
            <Text style={[theme.typography.caption, styles.kicker, { color: ink }]}>
              UNIT {module.unitNumber} · {teacher.name.toUpperCase()}
            </Text>
            <Text numberOfLines={2} style={[theme.typography.title, styles.title, { color: ink }]}>
              {module.title}
            </Text>
          </View>
          <View style={styles.mascot}>
            <Mascot character={module.teacherCharacterId} mood="happy" size="sm" />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.progressCopy}>
            <ProgressRing
              value={progress}
              size={42}
              strokeWidth={5}
              tone="mint"
              label={`Unit ${module.unitNumber} progress`}
              showLabel={false}
            />
            <Text style={[theme.typography.caption, styles.count, { color: ink }]}>
              {completed} of {total} lessons complete
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Jump to unit ${module.unitNumber}`}
            testID={`unit-jump-${module.id}`}
            onPress={onJumpToUnit}
            hitSlop={8}
            style={({ pressed }) => [
              styles.jump,
              {
                backgroundColor: ink === palette.white ? 'rgba(255,255,255,0.2)' : 'rgba(30,21,56,0.12)',
                borderColor: ink,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[theme.typography.caption, styles.jumpText, { color: ink }]}>JUMP TO UNIT</Text>
            <Icon name="arrow-right" color={ink} size={14} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ledge: { marginHorizontal: 16, marginVertical: 10, paddingBottom: 6 },
  band: { gap: 16, padding: 20, minHeight: 156 },
  row: { minHeight: 94, alignItems: 'center', flexDirection: 'row', gap: 8 },
  text: { flex: 1, gap: 5, minWidth: 0 },
  kicker: { fontWeight: '900', letterSpacing: 1.1, opacity: 0.9 },
  title: { lineHeight: 28 },
  mascot: { width: 88, height: 98, justifyContent: 'center', alignItems: 'center', overflow: 'visible' },
  footer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  progressCopy: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  count: { fontWeight: '900', opacity: 0.95 },
  jump: { alignItems: 'center', borderRadius: 999, borderWidth: 1.5, flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 8 },
  jumpText: { fontWeight: '900', letterSpacing: 0.8 },
});
