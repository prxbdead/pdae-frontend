import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function FireIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M12 3s5 4 5 8.5A5 5 0 0 1 7 11.5C7 8.5 9 6.5 10.5 5c.3 1.6 1.2 2.6 2.3 3.2C13.2 6.8 12.6 4.6 12 3Z" />
    </IconBase>
  );
}
