import { Polygon } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function StarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Polygon points="12,3 14.7,9.2 21.5,9.8 16.4,14.2 17.9,20.8 12,17.4 6.1,20.8 7.6,14.2 2.5,9.8 9.3,9.2" />
    </IconBase>
  );
}
