import { Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function FreezeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" />
      <Path d="M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" />
    </IconBase>
  );
}
