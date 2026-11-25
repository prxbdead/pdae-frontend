import {
  breakpoints,
  darkColors,
  lightColors,
  motion,
  radii,
  spacing,
  typography,
  type Breakpoints,
  type ColorTokens,
  type MotionTokens,
  type RadiusTokens,
  type SpacingTokens,
  type TypographyTokens,
} from './tokens';

export interface Theme {
  colors: ColorTokens;
  spacing: SpacingTokens;
  radii: RadiusTokens;
  typography: TypographyTokens;
  motion: MotionTokens;
  breakpoints: Breakpoints;
}

const shared = {
  spacing,
  radii,
  typography,
  motion,
  breakpoints,
};

export const lightTheme: Theme = {
  ...shared,
  colors: lightColors,
};

export const darkTheme: Theme = {
  ...shared,
  colors: darkColors,
};
