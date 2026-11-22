import type { ReactNode } from 'react';
import { Svg } from 'react-native-svg';

import { palette } from '@/theme/tokens';

export interface IconProps {
  color?: string;
  size?: number;
  testID?: string;
}

interface IconBaseProps extends IconProps {
  children: ReactNode;
}

/**
 * Every icon is drawn on a 24x24 viewBox with round caps and joins so the set
 * reads as one family. Stroke color defaults to the light-theme text color;
 * screens should pass `theme.colors.text` (or an on-fill color) explicitly.
 */
export function IconBase({
  color = palette.plum,
  size = 24,
  testID,
  children,
}: IconBaseProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      testID={testID}
      accessible={false}
    >
      {children}
    </Svg>
  );
}
