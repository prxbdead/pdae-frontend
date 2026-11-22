import { contrastRatio, meetsAA } from '../contrast';

describe('meetsAA', () => {
  it('accepts the approved text-on-fill pairs', () => {
    expect(meetsAA('#1E1538', '#F5F2FF')).toBe(true);
    expect(meetsAA('#FFFFFF', '#6C4CF1')).toBe(true);
    expect(meetsAA('#1E1538', '#3DDB80')).toBe(true);
    expect(meetsAA('#1E1538', '#FFD84D')).toBe(true);
    expect(meetsAA('#1E1538', '#FF5A6E')).toBe(true);
    expect(meetsAA('#1E1538', '#B9A8FF')).toBe(true);
    expect(meetsAA('#6B6185', '#F5F2FF')).toBe(true);
  });

  it('rejects white text on coral', () => {
    expect(meetsAA('#FFFFFF', '#FF5A6E')).toBe(false);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#FFFFFF', '#6C4CF1')).toBeCloseTo(
      contrastRatio('#6C4CF1', '#FFFFFF'),
    );
  });

  it('handles short hex notation', () => {
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 5);
  });

  it('rejects malformed colors', () => {
    expect(() => contrastRatio('plum', '#FFFFFF')).toThrow();
  });
});
