import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M6 6l12 12M18 6 6 18" />
    </IconBase>
  );
}
