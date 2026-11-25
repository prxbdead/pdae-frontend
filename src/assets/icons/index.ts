import type { ComponentType } from 'react';

import { ArrowLeftIcon } from './icon-arrow-left';
import { ArrowRightIcon } from './icon-arrow-right';
import { BoltIcon } from './icon-bolt';
import { BookIcon } from './icon-book';
import { ChartIcon } from './icon-chart';
import { CheckIcon } from './icon-check';
import { ChestIcon } from './icon-chest';
import { CloseIcon } from './icon-close';
import { CrownIcon } from './icon-crown';
import { FireIcon } from './icon-fire';
import { FreezeIcon } from './icon-freeze';
import { GemIcon } from './icon-gem';
import { HeartIcon } from './icon-heart';
import { KeyIcon } from './icon-key';
import { LearnIcon } from './icon-learn';
import { LeaguesIcon } from './icon-leagues';
import { LockIcon } from './icon-lock';
import { MoreIcon } from './icon-more';
import { PlayIcon } from './icon-play';
import { PracticeIcon } from './icon-practice';
import { ProfileIcon } from './icon-profile';
import { QuestsIcon } from './icon-quests';
import { SearchIcon } from './icon-search';
import { SettingsIcon } from './icon-settings';
import { ShieldIcon } from './icon-shield';
import { ShopIcon } from './icon-shop';
import { StarIcon } from './icon-star';
import { WalletIcon } from './icon-wallet';
import type { IconProps } from './IconBase';

export type IconName =
  | 'learn'
  | 'practice'
  | 'leagues'
  | 'quests'
  | 'profile'
  | 'settings'
  | 'fire'
  | 'bolt'
  | 'gem'
  | 'heart'
  | 'shield'
  | 'freeze'
  | 'lock'
  | 'check'
  | 'chest'
  | 'crown'
  | 'star'
  | 'chart'
  | 'wallet'
  | 'key'
  | 'search'
  | 'book'
  | 'shop'
  | 'play'
  | 'arrow-left'
  | 'arrow-right'
  | 'close'
  | 'more';

/** Registry is exhaustive: a missing icon is a compile error, not a fallback. */
export const ICONS: Record<IconName, ComponentType<IconProps>> = {
  learn: LearnIcon,
  practice: PracticeIcon,
  leagues: LeaguesIcon,
  quests: QuestsIcon,
  profile: ProfileIcon,
  settings: SettingsIcon,
  fire: FireIcon,
  bolt: BoltIcon,
  gem: GemIcon,
  heart: HeartIcon,
  shield: ShieldIcon,
  freeze: FreezeIcon,
  lock: LockIcon,
  check: CheckIcon,
  chest: ChestIcon,
  crown: CrownIcon,
  star: StarIcon,
  chart: ChartIcon,
  wallet: WalletIcon,
  key: KeyIcon,
  search: SearchIcon,
  book: BookIcon,
  shop: ShopIcon,
  play: PlayIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  close: CloseIcon,
  more: MoreIcon,
};

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export { IconBase } from './IconBase';
export type { IconProps } from './IconBase';
