import { Circle, Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Circle cx="11" cy="11" r="6.5" />
      <Path d="m16 16 4.5 4.5" />
    </IconBase>
  );
}
