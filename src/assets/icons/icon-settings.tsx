import { Circle, Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function SettingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </IconBase>
  );
}
