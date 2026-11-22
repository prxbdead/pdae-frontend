import type { BreakpointState } from '@/theme/useBreakpoint';

const { getBreakpoint } = jest.requireActual('@/theme/useBreakpoint');

/** Mutate `current` to simulate a viewport width. */
export const MOCK_WIDTH = { current: 375 };

export function useBreakpoint(): BreakpointState {
  return getBreakpoint(MOCK_WIDTH.current);
}
