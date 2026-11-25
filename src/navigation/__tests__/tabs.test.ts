import { ICONS } from '@/assets/icons';

import { TABS, isActiveTab } from '../tabs';

describe('TABS', () => {
  it('has unique keys and hrefs', () => {
    expect(new Set(TABS.map((tab) => tab.key)).size).toBe(TABS.length);
    expect(new Set(TABS.map((tab) => tab.href)).size).toBe(TABS.length);
  });

  it('uses icons that exist in the registry', () => {
    for (const tab of TABS) {
      expect(ICONS[tab.icon]).toBeDefined();
    }
  });

  it('defines the four v1 tabs in order', () => {
    expect(TABS.map((tab) => tab.key)).toEqual([
      'learn',
      'practice',
      'leagues',
      'profile',
    ]);
  });
});

describe('isActiveTab', () => {
  it('matches the exact route', () => {
    expect(isActiveTab('/learn', '/learn')).toBe(true);
    expect(isActiveTab('/practice', '/learn')).toBe(false);
  });

  it('matches nested routes', () => {
    expect(isActiveTab('/learn/unit-1', '/learn')).toBe(true);
    expect(isActiveTab('/practice/mistakes', '/practice')).toBe(true);
  });

  it('does not match a prefix that is not a path segment', () => {
    expect(isActiveTab('/learned', '/learn')).toBe(false);
  });
});
