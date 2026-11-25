import { Circle } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function MoreIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Circle cx="5" cy="12" r="1.5" />
      <Circle cx="12" cy="12" r="1.5" />
      <Circle cx="19" cy="12" r="1.5" />
    </IconBase>
  );
}
