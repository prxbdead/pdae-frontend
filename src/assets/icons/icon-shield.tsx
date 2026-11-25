import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function ShieldIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
    </IconBase>
  );
}
