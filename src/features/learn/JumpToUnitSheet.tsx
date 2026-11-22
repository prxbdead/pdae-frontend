import { Pressable, StyleSheet, Text } from 'react-native';

import { Sheet } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

import type { UnitSection } from './selectors';

export function scrollToUnit(
  ref: { scrollTo(params: { y: number; animated?: boolean }): void } | null,
  offset: number,
): void {
  ref?.scrollTo({ y: Math.max(0, offset), animated: true });
}

export interface JumpToUnitSheetProps {
  visible: boolean;
  units: UnitSection[];
  onClose(): void;
  onSelect(sectionIndex: number): void;
}

export function JumpToUnitSheet({
  visible,
  units,
  onClose,
  onSelect,
}: JumpToUnitSheetProps) {
  const theme = useTheme();

  return (
    <Sheet visible={visible} onClose={onClose} title="Jump to unit">
      {units.map((unit, index) => (
        <Pressable
          key={unit.module.id}
          accessibilityRole="button"
          accessibilityLabel={`Unit ${unit.module.unitNumber}: ${unit.module.title}, ${unit.completed} of ${unit.total} complete`}
          testID={`jump-unit-${unit.module.id}`}
          onPress={() => onSelect(index)}
          style={[
            styles.row,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          <Text
            style={[
              theme.typography.body,
              styles.title,
              { color: theme.colors.text },
            ]}
          >
            Unit {unit.module.unitNumber} · {unit.module.title}
          </Text>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textMuted }]}
          >
            {unit.completed}/{unit.total}
          </Text>
        </Pressable>
      ))}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  title: {
    flex: 1,
  },
});
