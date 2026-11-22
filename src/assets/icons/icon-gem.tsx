import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function GemIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M6 3h12l3 6-9 12L3 9l3-6Z" />
      <Path d="M3 9h18" />
      <Path d="m9 9 3 12 3-12" />
    </IconBase>
  );
}
