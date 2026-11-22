import { Circle } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function PracticeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Circle cx="12" cy="12" r="8" />
      <Circle cx="12" cy="12" r="4" />
      <Circle cx="12" cy="12" r="1" />
    </IconBase>
  );
}
