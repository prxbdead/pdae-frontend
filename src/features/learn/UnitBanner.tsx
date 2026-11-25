import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LearningModule } from '@/api/contracts';
import { CharacterArtwork } from '@/components/mascot/CharacterArtwork';
import { CHARACTERS } from '@/components/mascot/types';
import { Icon, ProgressRing } from '@/components/ui';
import { textVariants } from '@/theme/tokens';
import { toneColors } from '@/theme/tones';
import { useTheme } from '@/theme/useTheme';

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
  const accent = toneColors(theme.colors, module.accent ?? 'purple');
  const progress = total > 0 ? completed / total : 0;

  return (
    <View
      accessible
      accessibilityLabel={`Unit ${module.unitNumber}: ${module.title}, taught by ${teacher.name}`}
      testID={`unit-banner-${module.id}`}
      style={[
        styles.banner,
        {
          backgroundColor: accent.fill,
          borderBottomColor: accent.ledge,
          borderRadius: theme.radii.md,
          gap: theme.spacing.xs,
          marginHorizontal: theme.spacing.md,
          marginVertical: theme.spacing.xs,
          padding: theme.spacing.md,
        },
      ]}
    >
      <View style={styles.top}>
        <View style={styles.text}>
          <Text style={[textVariants.overline, { color: accent.on }]}>
            UNIT {module.unitNumber} · {teacher.name.toUpperCase()}
          </Text>
          <Text
            numberOfLines={2}
            style={[theme.typography.heading, { color: accent.on }]}
          >
            {module.title}
          </Text>
        </View>
        <View
          style={[
            styles.mascot,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.pill,
            },
          ]}
        >
          <CharacterArtwork character={module.teacherCharacterId} size={64} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.progress}>
          <View
            style={[
              styles.ringDisc,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radii.pill,
              },
            ]}
          >
            <ProgressRing
              value={progress}
              size={32}
              strokeWidth={5}
              tone="purple"
              label={`Unit ${module.unitNumber} progress`}
              showLabel={false}
            />
          </View>
          <Text style={[textVariants.label, { color: accent.on }]}>
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
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.pill,
              opacity: pressed ? 0.85 : 1,
              paddingHorizontal: theme.spacing.sm,
            },
          ]}
        >
          <Text style={[textVariants.overline, { color: theme.colors.text }]}>
            Units
          </Text>
          <Icon name="arrow-right" color={theme.colors.text} size={14} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderBottomWidth: 4 },
  top: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  text: { flex: 1, minWidth: 0 },
  mascot: {
    alignItems: 'center',
    height: 76,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 76,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  progress: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, gap: 8 },
  ringDisc: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  jump: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    height: 36,
  },
});
