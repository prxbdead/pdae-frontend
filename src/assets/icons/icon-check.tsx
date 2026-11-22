import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="m4.5 12.5 5 5 10-11" />
    </IconBase>
  );
}
