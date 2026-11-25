import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { CharacterArtwork } from '@/components/mascot/CharacterArtwork';
import { Icon } from '@/components/ui/Icon';
import { isActiveTab, TABS } from '@/navigation/tabs';
import { ledgeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export function Sidebar() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      testID="sidebar"
      accessibilityRole="tablist"
      style={[
        styles.sidebar,
        {
          backgroundColor: theme.colors.surface,
          borderRightColor: theme.colors.border,
          padding: theme.spacing.md,
        },
      ]}
    >
      <View
        style={[
          styles.brand,
          { gap: theme.spacing.xs, marginBottom: theme.spacing.lg },
        ]}
      >
        <CharacterArtwork character="hodlo" size={44} />
        <Text
          accessibilityRole="header"
          style={[theme.typography.title, { color: theme.colors.primary }]}
        >
          Hodlo
        </Text>
      </View>

      <View style={[styles.navigation, { gap: theme.spacing.xxs }]}>
        {TABS.map((tab) => {
          const selected = isActiveTab(pathname, tab.href);

          return (
            <Pressable
              key={tab.key}
              testID={`sidebar-tab-${tab.key}`}
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
                  gap: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.sm,
                },
              ]}
            >
              <Icon name={tab.icon} size={32} />
              <Text
                style={[
                  theme.typography.button,
                  {
                    color: selected
                      ? theme.colors.focus
                      : theme.colors.textMuted,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.spacer} />
      <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
        Educational only. Not financial advice.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 256,
    borderRightWidth: 2,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  navigation: {},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    minHeight: 56,
  },
  spacer: {
    flex: 1,
  },
});
