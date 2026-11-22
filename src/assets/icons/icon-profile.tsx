import { Circle, Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function ProfileIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </IconBase>
  );
}
