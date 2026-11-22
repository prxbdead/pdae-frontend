import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function BookIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15Z" />
      <Path d="M8 7h7M8 10.5h5" />
    </IconBase>
  );
}
