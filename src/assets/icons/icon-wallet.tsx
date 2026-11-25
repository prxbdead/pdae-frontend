import { Rect, Path, Circle } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function WalletIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Rect x="3" y="6" width="18" height="13" rx="2.5" />
      <Path d="M3 10h18" />
      <Circle cx="16.5" cy="14.5" r="1.2" />
    </IconBase>
  );
}
