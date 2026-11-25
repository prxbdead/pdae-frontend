import { Polygon } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function BoltIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Polygon points="13,2 5,13.5 10,13.5 9,22 19,10.5 14,10.5" />
    </IconBase>
  );
}
