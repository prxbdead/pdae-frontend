import type { TextStyle } from 'react-native';

/**
 * Raw Hodlo palette. Semantic colors reference these values; screens should
 * consume the themed `colors`, not `palette`, so dark mode keeps working.
 */
export const palette = {
  plum: '#1E1538',
  purple: '#6C4CF1',
  lilac: '#B9A8FF',
  mint: '#3DDB80',
  yellow: '#FFD84D',
  coral: '#FF5A6E',
  fox: '#F28A3A',
  neutral50: '#F5F2FF',
  neutral100: '#E6E0F7',
  neutral500: '#6B6185',
  white: '#FFFFFF',
  neutralBorder: '#C9BFE8',
  darkBackground: '#120D24',
  darkSurfaceAlt: '#2A2048',
  darkBorder: '#3A2E5C',
} as const;

/** Shade that gives each fill its 4 px bottom ledge. */
export const ledgeColors = {
  purple: '#4B32C4',
  lilac: '#8F7FE0',
  mint: '#27A85F',
  yellow: '#D9B32E',
  coral: '#C93B4D',
  plum: '#0F0A1F',
  neutral: '#C9BFE8',
} as const;

export type LedgeColor = keyof typeof ledgeColors;

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  success: string;
  onSuccess: string;
  warning: string;
  onWarning: string;
  danger: string;
  onDanger: string;
  focus: string;
  /** Vex-only surface color. Never use it for general UI. */
  fox: string;
}

export const lightColors: ColorTokens = {
  background: palette.neutral50,
  surface: palette.white,
  surfaceAlt: palette.neutral100,
  border: palette.neutralBorder,
  text: palette.plum,
  textMuted: palette.neutral500,
  primary: palette.purple,
  onPrimary: palette.white,
  secondary: palette.lilac,
  onSecondary: palette.plum,
  success: palette.mint,
  onSuccess: palette.plum,
  warning: palette.yellow,
  onWarning: palette.plum,
  danger: palette.coral,
  onDanger: palette.plum,
  focus: palette.purple,
  fox: palette.fox,
};

export const darkColors: ColorTokens = {
  background: palette.darkBackground,
  surface: palette.plum,
  surfaceAlt: palette.darkSurfaceAlt,
  border: palette.darkBorder,
  text: palette.neutral50,
  textMuted: palette.lilac,
  primary: palette.purple,
  onPrimary: palette.white,
  secondary: palette.lilac,
  onSecondary: palette.plum,
  success: palette.mint,
  onSuccess: palette.plum,
  warning: palette.yellow,
  onWarning: palette.plum,
  danger: palette.coral,
  onDanger: palette.plum,
  focus: palette.lilac,
  fox: palette.fox,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

/**
 * One family, fixed sizes. Nunito is loaded in fonts.ts; the family names are
 * the keys registered with expo-font.
 */
export const typography = {
  display: {
    fontFamily: 'Nunito_900Black',
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '900',
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
  },
  heading: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  body: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  caption: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  button: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export const motion = {
  press: 120,
  ui: 200,
  rewardMin: 400,
  reward: 600,
  rewardMax: 900,
} as const;

export const breakpoints = {
  tablet: 768,
  desktop: 1100,
  contentWidth: 600,
  lessonWidth: 720,
} as const;

export type SpacingTokens = typeof spacing;
export type RadiusTokens = typeof radii;
export type TypographyTokens = typeof typography;
export type MotionTokens = typeof motion;
export type Breakpoints = typeof breakpoints;
export type ColorTokensMap = ColorTokens;
