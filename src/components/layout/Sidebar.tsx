import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { CharacterArtwork } from '@/components/mascot/CharacterArtwork';
import { Icon } from '@/components/ui/Icon';
import { isActiveTab, TABS } from '@/navigation/tabs';
import { palette } from '@/theme/tokens';
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
        },
      ]}
    >
      <View style={styles.brand}>
        <CharacterArtwork character="hodlo" size={44} />
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>
          Hodlo
        </Text>
      </View>

      <View style={styles.navigation}>
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
              style={[
                styles.item,
                {
                  backgroundColor: selected
                    ? theme.colors.primary
                    : 'transparent',
                  borderRadius: theme.radii.lg,
                },
              ]}
            >
              <Icon name={tab.icon} size={28} />
              <Text
                style={[
                  theme.typography.body,
                  styles.itemText,
                  {
                    color: selected ? palette.white : theme.colors.textMuted,
                    fontWeight: selected ? '800' : '600',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 248,
    padding: 18,
    borderRightWidth: 1,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  navigation: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 12,
  },
  itemText: {
    flex: 1,
  },
});
