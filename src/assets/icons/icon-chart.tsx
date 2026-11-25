import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function ChartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M4 4v16h16" />
      <Path d="m7 15 4-4 3 3 5-6" />
    </IconBase>
  );
}
