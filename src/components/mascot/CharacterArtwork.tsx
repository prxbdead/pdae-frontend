import { Image } from 'expo-image';
import type { CharacterId } from './types';

const SOURCES: Record<CharacterId, number> = {
  hodlo: require('../../../assets/characters/hodlo.png'),
  chip: require('../../../assets/characters/chip.png'),
  tank: require('../../../assets/characters/tank.png'),
  grizz: require('../../../assets/characters/grizz.png'),
  vex: require('../../../assets/characters/vex.png'),
};

export interface CharacterArtworkProps {
  character: CharacterId;
  size?: number;
}

export function CharacterArtwork({ character, size = 120 }: CharacterArtworkProps) {
  return (
    <Image
      accessibilityLabel={`${character} character artwork`}
      contentFit="contain"
      source={SOURCES[character]}
      style={{ width: size, height: size }}
    />
  );
}
