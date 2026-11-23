import type { LearningModule } from '@/api/contracts';
import { CHARACTERS } from '@/components/mascot/types';
import { Icon, ProgressRing } from '@/components/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { contrastRatio } from '@/theme/contrast';
import { ledgeColors, palette } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

function onFill(background: string): string {
  return contrastRatio(palette.white, background) >=
    contrastRatio(palette.plum, background)
    ? palette.white
    : palette.plum;
}

const ACCENTS: Record<
  LearningModule['accent'],
  { fill: string; ledge: string }
> = {
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

export function UnitBanner({
  module,
  completed,
  total,
  onJumpToUnit,
}: UnitBannerProps) {
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
      style={[
        styles.ledge,
        {
          backgroundColor: accent.ledge,
          borderRadius: theme.radii.lg,
        },
      ]}
    >
      <View
        style={[
          styles.band,
          {
            backgroundColor: accent.fill,
            borderRadius: theme.radii.lg,
          },
        ]}
      >
        <View style={styles.row}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  ink === palette.white
                    ? 'rgba(255,255,255,0.22)'
                    : 'rgba(30,21,56,0.12)',
                borderColor: ink,
                borderRadius: theme.radii.md,
              },
            ]}
          >
            <Text style={[theme.typography.heading, { color: ink }]}>
              {teacher.name.charAt(0)}
            </Text>
          </View>

          <View style={styles.text}>
            <Text
              style={[theme.typography.caption, styles.kicker, { color: ink }]}
            >
              UNIT {module.unitNumber} · {teacher.name.toUpperCase()}
            </Text>
            <Text
              numberOfLines={1}
              style={[theme.typography.heading, { color: ink }]}
            >
              {module.title}
            </Text>
          </View>

          <View style={styles.ringTile}>
            <ProgressRing
              value={progress}
              size={42}
              strokeWidth={5}
              tone="mint"
              label={`Unit ${module.unitNumber} progress`}
              showLabel={false}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              theme.typography.caption,
              styles.count,
              { color: ink },
            ]}
          >
            {completed} of {total} lessons
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Jump to unit ${module.unitNumber}`}
            testID={`unit-jump-${module.id}`}
            onPress={onJumpToUnit}
            hitSlop={8}
            style={({ pressed }) => [
              styles.jump,
              {
                backgroundColor:
                  ink === palette.white
                    ? 'rgba(255,255,255,0.22)'
                    : 'rgba(30,21,56,0.12)',
                borderColor: ink,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={[theme.typography.caption, styles.jumpText, { color: ink }]}
            >
              JUMP TO UNIT
            </Text>
            <Icon name="arrow-right" color={ink} size={14} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ledge: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingBottom: 6,
  },
  band: {
    gap: 14,
    padding: 18,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    borderWidth: 2,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.85,
  },
  ringTile: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: 999,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  count: {
    fontWeight: '700',
    opacity: 0.85,
  },
  jump: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  jumpText: {
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
