import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function ChestIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M3 10a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8Z" />
      <Path d="M3 13h18" />
      <Path d="M10 13v3h4v-3" />
    </IconBase>
  );
}
