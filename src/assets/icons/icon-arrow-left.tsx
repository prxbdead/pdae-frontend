import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function ArrowLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M20 12H4M11 19l-7-7 7-7" />
    </IconBase>
  );
}
