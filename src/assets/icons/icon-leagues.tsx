import { Rect } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function LeaguesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Rect x="3" y="13" width="5" height="8" rx="1" />
      <Rect x="9.5" y="9" width="5" height="12" rx="1" />
      <Rect x="16" y="11" width="5" height="10" rx="1" />
    </IconBase>
  );
}
