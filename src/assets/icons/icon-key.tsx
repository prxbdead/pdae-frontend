import { Circle, Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function KeyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Circle cx="8" cy="15" r="4" />
      <Path d="m11 12 8-8M16 5l3 3M14 7l2 2" />
    </IconBase>
  );
}
