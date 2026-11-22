import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function LearnIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v14.5H6.5A2.5 2.5 0 0 0 4 20V5.5Z" />
      <Path d="M4 20a2 2 0 0 1 2-2h14" />
    </IconBase>
  );
}
