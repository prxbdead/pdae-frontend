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
            <View
              style={[
                styles.iconWrap,
                selected && {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderBottomColor: theme.colors.primary,
                  borderBottomWidth: 3,
                },
              ]}
            >
              <Icon name={tab.icon} size={28} />
            </View>
            <Text
              style={[
                theme.typography.caption,
                {
                  color: selected
                    ? theme.colors.primary
                    : theme.colors.textMuted,
                  fontWeight: selected ? '900' : '700',
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
    paddingTop: 6,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    height: 38,
    width: 56,
  },
});
