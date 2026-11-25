import { Image } from 'expo-image';
import type { CharacterId } from './types';

const SOURCES: Record<CharacterId, number> = {
  hodlo: require('../../../assets/characters/hodlo.svg'),
  chip: require('../../../assets/characters/chip.svg'),
  tank: require('../../../assets/characters/tank.svg'),
  grizz: require('../../../assets/characters/grizz.svg'),
  vex: require('../../../assets/characters/vex.svg'),
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
