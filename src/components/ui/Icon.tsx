import type { ComponentType } from 'react';
import { Circle, Svg } from 'react-native-svg';

import { ICONS, type IconName, type IconProps as BaseIconProps } from '@/assets/icons';
import { palette } from '@/theme/tokens';

import { Artwork, type ArtworkName } from './Artwork';

export type IconProps = BaseIconProps & {
  name: IconName;
};

const ORIGINAL_ARTWORK: Partial<Record<IconName, ArtworkName>> = {
  learn: 'book',
  practice: 'practice',
  leagues: 'leagues',
  quests: 'chest',
  profile: 'profile',
  fire: 'fire',
  bolt: 'bolt',
  gem: 'diamond',
  heart: 'heart',
  shield: 'shield',
  freeze: 'freeze',
  lock: 'locked',
  check: 'completed',
  chest: 'chest',
  star: 'level',
  book: 'book',
  shop: 'shop',
  crown: 'perfect',
  settings: 'settings',
  chart: 'chart',
  wallet: 'wallet',
  key: 'key',
  search: 'search',
};

const warned = new Set<string>();

export function Icon({
  name,
  color = palette.plum,
  size = 24,
  testID,
}: IconProps) {
  const artwork = ORIGINAL_ARTWORK[name];

  if (artwork) {
    return <Artwork name={artwork} size={size} testID={testID} />;
  }

  const Component = (
    ICONS as Record<string, ComponentType<BaseIconProps> | undefined>
  )[name];

  if (!Component) {
    if (__DEV__ && !warned.has(name)) {
      warned.add(name);
      console.warn(`[Icon] Unknown icon "${name}". Rendering a neutral dot.`);
    }

    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
        testID={testID}
      >
        <Circle cx={12} cy={12} r={4} />
      </Svg>
    );
  }

  return <Component color={color} size={size} testID={testID} />;
}
