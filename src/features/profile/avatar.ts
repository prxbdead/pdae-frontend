import { contrastRatio } from '@/theme/contrast';
import { palette } from '@/theme/tokens';

const AVATAR_COLORS = [
  palette.purple,
  palette.mint,
  palette.coral,
  palette.yellow,
  palette.lilac,
  palette.fox,
] as const;

/** Up to two initials, e.g. "Robin" -> "R", "Ada Lovelace" -> "AL". */
export function avatarInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '?';
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/** Deterministic color so the same learner keeps the same avatar tile. */
export function avatarColor(id: string): string {
  let hash = 0;

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }

  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function avatarTextColor(id: string): string {
  const background = avatarColor(id);

  return contrastRatio(palette.white, background) >=
    contrastRatio(palette.plum, background)
    ? palette.white
    : palette.plum;
}
