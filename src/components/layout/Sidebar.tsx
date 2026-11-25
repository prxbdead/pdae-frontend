import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

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
        <View style={styles.brandMark}><Text style={styles.brandLetter}>H</Text></View>
        <View>
          <Text style={[theme.typography.title, { color: theme.colors.text }]}>Hodlo</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>LEARN SMARTER</Text>
        </View>
      </View>

      <Text style={[theme.typography.caption, styles.sectionLabel, { color: theme.colors.textMuted }]}>YOUR SPACE</Text>
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
                backgroundColor: selected ? theme.colors.primary : 'transparent',
                borderRadius: theme.radii.lg,
              },
            ]}
          >
            <Icon name={tab.icon} size={23} color={selected ? palette.white : theme.colors.textMuted} />
            <Text style={[theme.typography.body, styles.itemText, { color: selected ? palette.white : theme.colors.textMuted, fontWeight: selected ? '800' : '600' }]}>
              {tab.label}
            </Text>
            {selected ? <View style={styles.activeDot} /> : null}
          </Pressable>
        );
      })}

      <View style={styles.bottom}>
        <View style={[styles.tip, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radii.lg }]}>
          <Text style={[theme.typography.caption, { color: theme.colors.text, fontWeight: '800' }]}>ONE STEP AT A TIME</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Build knowledge before taking risk.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { width: 248, padding: 18, gap: 6, borderRightWidth: 1 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28, paddingHorizontal: 4 },
  brandMark: { width: 44, height: 44, borderRadius: 15, backgroundColor: palette.purple, borderBottomWidth: 4, borderBottomColor: '#4B32C4', alignItems: 'center', justifyContent: 'center' },
  brandLetter: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  sectionLabel: { fontWeight: '900', letterSpacing: 1.1, marginHorizontal: 10, marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 14 },
  itemText: { flex: 1 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingBottom: 8 },
  tip: { gap: 6, padding: 14 },
});
