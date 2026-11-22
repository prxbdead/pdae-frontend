import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { Icon } from '@/components/ui/Icon';
import { isActiveTab, TABS } from '@/navigation/tabs';
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
      <Text
        style={[
          theme.typography.title,
          styles.wordmark,
          { color: theme.colors.text },
        ]}
      >
        Hodlo
      </Text>

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
                  ? theme.colors.surfaceAlt
                  : 'transparent',
                borderRadius: theme.radii.md,
              },
            ]}
          >
            <Icon
              name={tab.icon}
              size={24}
              color={selected ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text
              style={[
                theme.typography.body,
                {
                  color: selected
                    ? theme.colors.primary
                    : theme.colors.textMuted,
                  fontWeight: selected ? '700' : '400',
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 248,
    padding: 16,
    gap: 4,
    borderRightWidth: 1,
  },
  wordmark: {
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 12,
  },
});
