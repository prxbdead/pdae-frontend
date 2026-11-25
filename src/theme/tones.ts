import type { ColorTokens } from './tokens';
import { ledgeColors, palette } from './tokens';

export type Tone = 'purple' | 'mint' | 'yellow' | 'coral' | 'lilac';

export interface ToneColors {
  /** Saturated fill for buttons, banners, and active states. */
  fill: string;
  /** Darker shade that forms the 4 px bottom ledge under `fill`. */
  ledge: string;
  /** Text and icon color that meets AA on `fill`. */
  on: string;
  /** Quiet tint for tiles and cards. Use with the normal text colors. */
  soft: string;
}

/**
 * One lookup for every accent so screens do not repeat the fill, ledge, and
 * text-on-fill rules from the design system.
 */
export function toneColors(colors: ColorTokens, tone: Tone): ToneColors {
  switch (tone) {
    case 'mint':
      return {
        fill: colors.success,
        ledge: ledgeColors.mint,
        on: colors.onSuccess,
        soft: colors.successSoft,
      };
    case 'yellow':
      return {
        fill: colors.warning,
        ledge: ledgeColors.yellow,
        on: colors.onWarning,
        soft: colors.warningSoft,
      };
    case 'coral':
      return {
        fill: colors.danger,
        ledge: ledgeColors.coral,
        on: colors.onDanger,
        soft: colors.dangerSoft,
      };
    case 'lilac':
      return {
        fill: colors.secondary,
        ledge: ledgeColors.lilac,
        on: colors.onSecondary,
        soft: colors.primarySoft,
      };
    default:
      return {
        fill: colors.primary,
        ledge: ledgeColors.purple,
        on: palette.white,
        soft: colors.primarySoft,
      };
  }
}
