import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function HeartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M12 20.5s-8-4.7-8-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 8 2.9c0 5.5-8 10.2-8 10.2Z" />
    </IconBase>
  );
}
