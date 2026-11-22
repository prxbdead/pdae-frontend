import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function ShopIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M4 9.5 6 4h12l2 5.5" />
      <Path d="M4 9.5h16V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z" />
      <Path d="M9.5 21v-5h5v5" />
    </IconBase>
  );
}
