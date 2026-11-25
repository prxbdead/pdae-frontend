import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '@/assets/icons';
import { CharacterArtwork } from '@/components/mascot/CharacterArtwork';
import type { CharacterId } from '@/components/mascot/types';
import { Card, Icon } from '@/components/ui';
import { textVariants } from '@/theme/tokens';
import { toneColors, type Tone } from '@/theme/tones';
import { useTheme } from '@/theme/useTheme';

import type { PracticeItem } from './usePracticeData';

const CHARACTERS_BY_KIND: Partial<Record<PracticeItem['kind'], CharacterId>> = {
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
  const tone = toneColors(theme.colors, item.tone as Tone);
  const character = CHARACTERS_BY_KIND[item.kind];

  return (
    <Card
      accessibilityLabel={item.title}
      disabled={item.disabled}
      onPress={onPress}
      testID={`practice-card-${item.kind}`}
      style={styles.card}
      padded={false}
    >
      <View
        style={[
          styles.art,
          { backgroundColor: tone.soft, borderRadius: theme.radii.md },
        ]}
      >
        {character ? (
          <CharacterArtwork character={character} size={64} />
        ) : (
          <Icon name={ICONS[item.kind] ?? item.icon} size={48} />
        )}
      </View>
      <View style={styles.text}>
        <Text
          numberOfLines={2}
          style={[textVariants.bodyStrong, { color: theme.colors.text }]}
        >
          {item.title}
        </Text>
        <Text
          numberOfLines={2}
          style={[theme.typography.caption, { color: theme.colors.textMuted }]}
        >
          {item.description}
        </Text>
        {item.badge ? (
          <Text
            style={[
              textVariants.overline,
              {
                color: item.disabled
                  ? theme.colors.textMuted
                  : theme.colors.focus,
              },
            ]}
          >
            {item.badge}
          </Text>
        ) : null}
      </View>
      {!item.disabled ? (
        <Icon name="arrow-right" color={theme.colors.textMuted} size={20} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  art: {
    alignItems: 'center',
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  text: { flex: 1, gap: 2, minWidth: 0 },
});
