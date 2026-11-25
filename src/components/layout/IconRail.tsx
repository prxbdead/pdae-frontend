import { Pressable, StyleSheet, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { CharacterArtwork } from '@/components/mascot/CharacterArtwork';
import { Icon } from '@/components/ui/Icon';
import { isActiveTab, TABS } from '@/navigation/tabs';
import { ledgeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export function IconRail() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      testID="icon-rail"
      accessibilityRole="tablist"
      style={[
        styles.rail,
        {
          backgroundColor: theme.colors.surface,
          borderRightColor: theme.colors.border,
          gap: theme.spacing.xs,
          paddingVertical: theme.spacing.md,
        },
      ]}
    >
      <View style={{ marginBottom: theme.spacing.sm }}>
        <CharacterArtwork character="hodlo" size={44} />
      </View>
      {TABS.map((tab) => {
        const selected = isActiveTab(pathname, tab.href);

        return (
          <Pressable
            key={tab.key}
            testID={`rail-tab-${tab.key}`}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            onPress={() => router.replace(tab.href)}
            style={({ pressed }) => [
              styles.item,
              {
                backgroundColor: selected
                  ? theme.colors.primarySoft
                  : pressed
                    ? theme.colors.surfaceAlt
                    : 'transparent',
                borderColor: selected ? ledgeColors.lilac : 'transparent',
                borderRadius: theme.radii.md,
              },
            ]}
          >
            <Icon name={tab.icon} size={32} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 88,
    alignItems: 'center',
    borderRightWidth: 2,
  },
  item: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
