import { Image } from 'expo-image';

export type ArtworkName =
  | 'profile'
  | 'bolt'
  | 'book'
  | 'chest'
  | 'diamond'
  | 'practice'
  | 'fire'
  | 'freeze'
  | 'heart'
  | 'level'
  | 'completed'
  | 'perfect'
  | 'locked'
  | 'shield'
  | 'shop';

const SOURCES: Record<ArtworkName, number> = {
  profile: require('../../../assets/artwork/profile.svg'),
  bolt: require('../../../assets/artwork/bolt.svg'),
  book: require('../../../assets/artwork/book.svg'),
  chest: require('../../../assets/artwork/chest.svg'),
  diamond: require('../../../assets/artwork/diamond.svg'),
  practice: require('../../../assets/artwork/practice.svg'),
  fire: require('../../../assets/artwork/fire.svg'),
  freeze: require('../../../assets/artwork/freeze.svg'),
  heart: require('../../../assets/artwork/heart.svg'),
  level: require('../../../assets/artwork/level.svg'),
  completed: require('../../../assets/artwork/completed.svg'),
  perfect: require('../../../assets/artwork/perfect.svg'),
  locked: require('../../../assets/artwork/locked.svg'),
  shield: require('../../../assets/artwork/shield.svg'),
  shop: require('../../../assets/artwork/shop.svg'),
};

export interface ArtworkProps {
  name: ArtworkName;
  size?: number;
  width?: number;
  height?: number;
  testID?: string;
}

/** Renders the original multicolor SVG artwork supplied for Hodlo. */
export function Artwork({ name, size = 24, width = size, height = size, testID }: ArtworkProps) {
  return (
    <Image
      source={SOURCES[name]}
      contentFit="contain"
      style={{ width, height }}
      testID={testID}
    />
  );
}
