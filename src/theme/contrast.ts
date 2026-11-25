/** WCAG AA minimum contrast ratio for normal-size text. */
export const AA_NORMAL_TEXT = 4.5;

/** WCAG AA minimum contrast ratio for large text (18 pt+ or 14 pt+ bold). */
export const AA_LARGE_TEXT = 3;

const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function parseHex(hex: string): [number, number, number] {
  const value = hex.trim();

  if (!HEX_PATTERN.test(value)) {
    throw new Error(`Unsupported color: ${hex}. Use #RGB or #RRGGBB.`);
  }

  const digits =
    value.length === 4
      ? value
          .slice(1)
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : value.slice(1);

  return [
    parseInt(digits.slice(0, 2), 16),
    parseInt(digits.slice(2, 4), 16),
    parseInt(digits.slice(4, 6), 16),
  ];
}

function channelToLinear(channel: number): number {
  const normalized = channel / 255;

  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [red, green, blue] = parseHex(hex);

  return (
    0.2126 * channelToLinear(red) +
    0.7152 * channelToLinear(green) +
    0.0722 * channelToLinear(blue)
  );
}

export function contrastRatio(foreground: string, background: string): number {
  const lighter = relativeLuminance(foreground);
  const darker = relativeLuminance(background);
  const [max, min] = lighter >= darker ? [lighter, darker] : [darker, lighter];

  return (max + 0.05) / (min + 0.05);
}

export function meetsAA(
  foreground: string,
  background: string,
  largeText = false,
): boolean {
  const minimum = largeText ? AA_LARGE_TEXT : AA_NORMAL_TEXT;

  return contrastRatio(foreground, background) >= minimum;
}
