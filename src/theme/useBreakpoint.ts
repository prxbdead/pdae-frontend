import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { breakpoints } from './tokens';

export interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

export function getBreakpoint(width: number): BreakpointState {
  return {
    isMobile: width < breakpoints.tablet,
    isTablet: width >= breakpoints.tablet && width < breakpoints.desktop,
    isDesktop: width >= breakpoints.desktop,
    width,
  };
}

export function useBreakpoint(): BreakpointState {
  const { width } = useWindowDimensions();

  return useMemo(() => getBreakpoint(width), [width]);
}
