import type { IconName } from '@/assets/icons';

export type TabKey = 'learn' | 'practice' | 'leagues' | 'profile';

export interface TabDefinition {
  key: TabKey;
  label: string;
  icon: IconName;
  href: string;
}

export const TABS: readonly TabDefinition[] = [
  { key: 'learn', label: 'Learn', icon: 'learn', href: '/learn' },
  { key: 'practice', label: 'Practice', icon: 'practice', href: '/practice' },
  { key: 'leagues', label: 'Leagues', icon: 'leagues', href: '/leagues' },
  { key: 'profile', label: 'Profile', icon: 'profile', href: '/profile' },
];

/** True for the tab route itself and any nested route beneath it. */
export function isActiveTab(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
