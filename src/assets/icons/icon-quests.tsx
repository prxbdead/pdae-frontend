import { Circle, Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function QuestsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M15.5 8.5 13.8 13.8 8.5 15.5 10.2 10.2Z" />
    </IconBase>
  );
}
