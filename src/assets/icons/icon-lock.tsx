import { Rect, Path } from 'react-native-svg';

import { IconBase, type IconProps } from './IconBase';

export function LockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <Rect x="4" y="10.5" width="16" height="10.5" rx="2" />
      <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </IconBase>
  );
}
