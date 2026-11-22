import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { Icon } from '@/components/ui/Icon';
import { isActiveTab, TABS } from '@/navigation/tabs';
import { useTheme } from '@/theme/useTheme';

export function BottomTabs() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      testID="bottom-tabs"
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      {TABS.map((tab) => {
        const selected = isActiveTab(pathname, tab.href);

        return (
          <Pressable
            key={tab.key}
            testID={`tab-${tab.key}`}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            onPress={() => router.replace(tab.href)}
            style={styles.tab}
          >
            <Icon
              name={tab.icon}
              size={24}
              color={selected ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text
              style={[
                theme.typography.caption,
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
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
});
