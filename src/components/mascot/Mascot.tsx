import { MascotPlaceholder } from './MascotPlaceholder';
import type { MascotProps } from './types';

/**
 * The single mascot surface used by screens. Today it renders the static
 * placeholder; the 3D spike replaces this file's implementation behind the
 * same props without touching call sites.
 */
export function Mascot(props: MascotProps) {
  return <MascotPlaceholder {...props} />;
}
