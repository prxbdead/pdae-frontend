import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { Icon } from '@/components/ui/Icon';
import { isActiveTab, TABS } from '@/navigation/tabs';
import { ledgeColors, textVariants } from '@/theme/tokens';
import { useSafeInsets } from '@/theme/useSafeInsets';
import { useTheme } from '@/theme/useTheme';

export function BottomTabs() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { bottom } = useSafeInsets();

  return (
    <View
      testID="bottom-tabs"
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: theme.spacing.xs + bottom,
          paddingHorizontal: theme.spacing.xs,
          paddingTop: theme.spacing.xs,
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
                {
                  backgroundColor: selected
                    ? theme.colors.primarySoft
                    : 'transparent',
                  borderColor: selected ? ledgeColors.lilac : 'transparent',
                  borderRadius: theme.radii.md,
                },
              ]}
            >
              <Icon name={tab.icon} size={28} />
            </View>
            <Text
              style={[
                textVariants.label,
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
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 2,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    height: 40,
    width: 56,
  },
});
