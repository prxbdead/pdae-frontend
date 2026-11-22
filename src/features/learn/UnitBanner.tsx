import type { LearningModule } from '@/api/contracts';
import { CHARACTERS } from '@/components/mascot/types';
import { ProgressRing } from '@/components/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { contrastRatio } from '@/theme/contrast';
import { palette } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

function onFill(background: string): string {
  return contrastRatio(palette.white, background) >=
    contrastRatio(palette.plum, background)
    ? palette.white
    : palette.plum;
}

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
  const progress = total > 0 ? completed / total : 0;

  return (
    <View
      accessible
      accessibilityLabel={`Unit ${module.unitNumber}: ${module.title}, taught by ${teacher.name}`}
      testID={`unit-banner-${module.id}`}
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
        },
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: teacher.color,
              borderColor: teacher.accent,
              borderRadius: theme.radii.md,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.heading,
              { color: onFill(teacher.color) },
            ]}
          >
            {teacher.name.charAt(0)}
          </Text>
        </View>

        <View style={styles.text}>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textMuted }]}
          >
            UNIT {module.unitNumber} · {teacher.name.toUpperCase()}
          </Text>
          <Text
            style={[theme.typography.heading, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {module.title}
          </Text>
        </View>

        <ProgressRing
          value={progress}
          size={48}
          strokeWidth={5}
          tone="mint"
          label={`Unit ${module.unitNumber} progress`}
          showLabel={false}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Jump to unit ${module.unitNumber}`}
        testID={`unit-jump-${module.id}`}
        onPress={onJumpToUnit}
        hitSlop={8}
      >
        <Text
          style={[
            theme.typography.caption,
            styles.jump,
            { color: theme.colors.primary },
          ]}
        >
          Jump to unit
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    borderWidth: 3,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  jump: {
    fontWeight: '700',
    textAlign: 'right',
  },
});
