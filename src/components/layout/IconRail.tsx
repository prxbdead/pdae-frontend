import { Pressable, StyleSheet, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { Icon } from '@/components/ui/Icon';
import { isActiveTab, TABS } from '@/navigation/tabs';
import { useTheme } from '@/theme/useTheme';

export function IconRail() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View testID="icon-rail" accessibilityRole="tablist" style={[styles.rail, { backgroundColor: theme.colors.surface, borderRightColor: theme.colors.border }]}>
      {TABS.map((tab) => {
        const selected = isActiveTab(pathname, tab.href);
        return (
          <Pressable key={tab.key} testID={`rail-tab-${tab.key}`} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{ selected }} onPress={() => router.replace(tab.href)} style={[styles.item, { backgroundColor: selected ? theme.colors.primary : 'transparent', borderBottomWidth: selected ? 3 : 0, borderBottomColor: '#4B32C4', borderRadius: theme.radii.md }]}>
            <Icon name={tab.icon} size={25} color={selected ? '#FFFFFF' : theme.colors.textMuted} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { width: 88, alignItems: 'center', paddingVertical: 16, gap: 10, borderRightWidth: 1 },
  item: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
});
