import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function CrownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M3 8l4 3 5-6 5 6 4-3-2 11H5L3 8Z" />
    </IconBase>
  );
}
