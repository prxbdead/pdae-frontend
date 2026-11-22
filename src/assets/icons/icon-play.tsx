import { Polygon } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function PlayIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Polygon points="8,5 19,12 8,19" />
    </IconBase>
  );
}
