import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M4 12h16M13 5l7 7-7 7" />
    </IconBase>
  );
}
