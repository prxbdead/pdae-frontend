import {
  breakpoints,
  darkColors,
  ledgeColors,
  lightColors,
  motion,
  radii,
  spacing,
  typography,
} from '../tokens';

describe('palette', () => {
  it('uses the Hodlo light palette', () => {
    expect(lightColors).toMatchObject({
      background: '#F5F2FF',
      surface: '#FFFFFF',
      surfaceAlt: '#E6E0F7',
      border: '#C9BFE8',
      text: '#1E1538',
      textMuted: '#6B6185',
      primary: '#6C4CF1',
      onPrimary: '#FFFFFF',
      secondary: '#B9A8FF',
      onSecondary: '#1E1538',
      success: '#3DDB80',
      onSuccess: '#1E1538',
      warning: '#FFD84D',
      onWarning: '#1E1538',
      danger: '#FF5A6E',
      onDanger: '#1E1538',
    });
  });

  it('uses the Hodlo dark palette', () => {
    expect(darkColors).toMatchObject({
      background: '#120D24',
      surface: '#1E1538',
      surfaceAlt: '#2A2048',
      border: '#3A2E5C',
      text: '#F5F2FF',
      textMuted: '#B9A8FF',
    });
  });

  it('only allows fox orange on Vex surfaces', () => {
    const foxUsages = [lightColors, darkColors].flatMap((colors) =>
      Object.entries(colors).filter(([, value]) => value === '#F28A3A'),
    );

    expect(foxUsages.map(([key]) => key)).toEqual(['fox', 'fox']);
  });

  it('uses the ledge shades', () => {
    expect(ledgeColors).toEqual({
      purple: '#4B32C4',
      lilac: '#8F7FE0',
      mint: '#27A85F',
      yellow: '#D9B32E',
      coral: '#C93B4D',
      plum: '#0F0A1F',
      neutral: '#C9BFE8',
    });
  });
});

describe('scales', () => {
  it('uses only the approved spacing steps', () => {
    expect(Object.values(spacing)).toEqual([4, 8, 12, 16, 24, 32, 48, 64]);
  });

  it('uses only the approved radii', () => {
    expect(Object.values(radii)).toEqual([12, 16, 24, 999]);
  });

  it('uses the Nunito type scale', () => {
    expect(typography.display).toMatchObject({
      fontSize: 40,
      lineHeight: 44,
      fontWeight: '900',
    });
    expect(typography.title).toMatchObject({
      fontSize: 28,
      lineHeight: 32,
      fontWeight: '700',
    });
    expect(typography.heading).toMatchObject({
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '700',
    });
    expect(typography.body).toMatchObject({
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
    });
    expect(typography.caption).toMatchObject({
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400',
    });
    expect(typography.button).toMatchObject({
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    });
  });

  it('uses the motion durations', () => {
    expect(motion).toMatchObject({
      press: 120,
      ui: 200,
      reward: 600,
      rewardMin: 400,
      rewardMax: 900,
    });
  });

  it('uses the layout breakpoints and column widths', () => {
    expect(breakpoints).toMatchObject({
      tablet: 768,
      desktop: 1100,
      contentWidth: 600,
      lessonWidth: 720,
    });
  });
});
