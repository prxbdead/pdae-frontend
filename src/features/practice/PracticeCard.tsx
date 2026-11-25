import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { IconName } from '@/assets/icons';
import { Mascot } from '@/components/mascot/Mascot';
import { Icon } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';
import type { PracticeItem, PracticeTone } from './usePracticeData';

const TONES: Record<PracticeTone, 'primary' | 'success' | 'danger' | 'warning' | 'secondary'> = {
  purple: 'primary',
  mint: 'success',
  coral: 'danger',
  yellow: 'warning',
  lilac: 'secondary',
};

const MASCOTS: Partial<Record<PracticeItem['kind'], 'hodlo' | 'chip' | 'tank' | 'grizz' | 'vex'>> = {
  mistakes: 'hodlo',
  chart: 'chip',
  scam: 'vex',
  risk: 'grizz',
  dca: 'tank',
};

const ICONS: Partial<Record<PracticeItem['kind'], IconName>> = {
  trading: 'chart',
  flashcards: 'book',
};

export interface PracticeCardProps {
  item: PracticeItem;
  onPress(): void;
}

export function PracticeCard({ item, onPress }: PracticeCardProps) {
  const theme = useTheme();
  const fill = theme.colors[TONES[item.tone]];
  const character = MASCOTS[item.kind];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      accessibilityState={{ disabled: item.disabled }}
      disabled={item.disabled}
      onPress={onPress}
      testID={`practice-card-${item.kind}`}
      style={styles.pressable}
    >
      {({ pressed }) => (
        <View style={[styles.ledge, { backgroundColor: item.disabled ? theme.colors.surfaceAlt : theme.colors.border, borderRadius: theme.radii.lg }]}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.lg, transform: [{ translateY: pressed ? 4 : 0 }], opacity: item.disabled ? 0.64 : 1 }]}>
            <View style={[styles.art, { backgroundColor: `${fill}18`, borderRadius: theme.radii.md }]}>
              {character ? (
                <Mascot character={character} mood="happy" size="sm" />
              ) : (
                <Icon name={ICONS[item.kind] ?? item.icon} color={fill} size={30} />
              )}
            </View>
            <View style={styles.text}>
              <Text style={[theme.typography.heading, { color: theme.colors.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]} numberOfLines={2}>{item.description}</Text>
              {item.badge ? <Text style={[theme.typography.caption, styles.badge, { color: item.disabled ? theme.colors.textMuted : theme.colors.primary }]}>{item.badge}</Text> : null}
            </View>
            {!item.disabled ? <Icon name="arrow-right" color={theme.colors.textMuted} size={19} /> : null}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: '100%' },
  ledge: { paddingBottom: 5 },
  card: { alignItems: 'center', borderWidth: 1.5, flexDirection: 'row', gap: 13, minHeight: 124, padding: 13 },
  art: { alignItems: 'center', justifyContent: 'center', width: 86, height: 96, overflow: 'hidden' },
  text: { flex: 1, gap: 3, minWidth: 0 },
  badge: { fontWeight: '900', letterSpacing: 0.4, marginTop: 2, textTransform: 'uppercase' },
});
