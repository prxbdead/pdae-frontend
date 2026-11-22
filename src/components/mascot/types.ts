import { palette } from '@/theme/tokens';
import type { CharacterId, MascotMood } from '@/types/domain';

export type { CharacterId, MascotMood };

export interface MascotProps {
  character: CharacterId;
  mood: MascotMood;
  /** Reserved for the 3D integration; ignored by the static placeholder. */
  intensity?: number;
  onPress?(): void;
  size?: 'sm' | 'md' | 'lg';
}

export interface CharacterMeta {
  name: string;
  catchphrase: string;
  color: string;
  accent: string;
}

export const CHARACTERS: Record<CharacterId, CharacterMeta> = {
  hodlo: {
    name: 'Hodlo',
    catchphrase: 'Small steps, fewer rug pulls.',
    color: palette.purple,
    accent: palette.lilac,
  },
  chip: {
    name: 'Chip',
    catchphrase: 'Read the chart, not the shill.',
    color: palette.mint,
    accent: palette.coral,
  },
  tank: {
    name: 'Tank',
    catchphrase: 'Boring compounding wins.',
    color: palette.mint,
    accent: palette.purple,
  },
  grizz: {
    name: 'Grizz',
    catchphrase: 'Size the risk before the trade.',
    color: palette.purple,
    accent: palette.coral,
  },
  vex: {
    name: 'Vex',
    catchphrase: "If it's urgent, it's a scam.",
    color: palette.fox,
    accent: palette.neutral50,
  },
};
