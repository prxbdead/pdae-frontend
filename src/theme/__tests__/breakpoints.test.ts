import { getBreakpoint } from '../useBreakpoint';

describe('getBreakpoint', () => {
  it('classifies mobile below 768', () => {
    expect(getBreakpoint(375)).toMatchObject({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      width: 375,
    });
    expect(getBreakpoint(767).isMobile).toBe(true);
  });

  it('classifies tablet from 768 to 1099', () => {
    expect(getBreakpoint(768)).toMatchObject({
      isMobile: false,
      isTablet: true,
      isDesktop: false,
    });
    expect(getBreakpoint(1099).isTablet).toBe(true);
  });

  it('classifies desktop from 1100', () => {
    expect(getBreakpoint(1100)).toMatchObject({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
    expect(getBreakpoint(1440).isDesktop).toBe(true);
  });
});
