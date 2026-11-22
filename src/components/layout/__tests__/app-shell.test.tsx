/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock factories cannot close over imports */
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { MOCK_WIDTH } from '@/testing/breakpoint-mock';
import { routerMock, setPathname } from '@/testing/expo-router-mock';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { AppShell } from '../AppShell';

jest.mock('expo-router', () => require('@/testing/expo-router-mock'));
jest.mock('@/theme/useBreakpoint', () => require('@/testing/breakpoint-mock'));

function renderShell() {
  return render(
    <ThemeProvider>
      <AppShell>
        <Text>Content</Text>
      </AppShell>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  MOCK_WIDTH.current = 375;
  setPathname('/learn');
  routerMock.replace.mockClear();
});

describe('AppShell', () => {
  it('renders bottom tabs on mobile and no rail or sidebar', () => {
    renderShell();

    expect(screen.getByTestId('bottom-tabs')).toBeOnTheScreen();
    expect(screen.queryByTestId('icon-rail')).toBeNull();
    expect(screen.queryByTestId('sidebar')).toBeNull();
    expect(screen.queryByTestId('right-rail')).toBeNull();
  });

  it('renders the icon rail on tablet without the desktop rails', () => {
    MOCK_WIDTH.current = 900;
    renderShell();

    expect(screen.getByTestId('icon-rail')).toBeOnTheScreen();
    expect(screen.queryByTestId('bottom-tabs')).toBeNull();
    expect(screen.queryByTestId('sidebar')).toBeNull();
    expect(screen.queryByTestId('right-rail')).toBeNull();
  });

  it('renders sidebar, content column, and right rail on desktop', () => {
    MOCK_WIDTH.current = 1280;
    renderShell();

    expect(screen.getByTestId('sidebar')).toBeOnTheScreen();
    expect(screen.getByTestId('content-column')).toBeOnTheScreen();
    expect(screen.getByTestId('right-rail')).toBeOnTheScreen();
    expect(screen.queryByTestId('bottom-tabs')).toBeNull();
    expect(screen.queryByTestId('icon-rail')).toBeNull();
  });

  it('marks the active tab as selected', () => {
    setPathname('/practice');
    renderShell();

    expect(screen.getByTestId('tab-practice').props.accessibilityState).toMatchObject(
      { selected: true },
    );
    expect(screen.getByTestId('tab-learn').props.accessibilityState).toMatchObject(
      { selected: false },
    );
  });

  it('navigates with router.replace when a tab is pressed', () => {
    renderShell();

    fireEvent.press(screen.getByTestId('tab-leagues'));

    expect(routerMock.replace).toHaveBeenCalledWith('/leagues');
  });

  it('keeps the same four tabs at every breakpoint', () => {
    const cases = [
      [375, 'tab-'],
      [900, 'rail-tab-'],
      [1280, 'sidebar-tab-'],
    ] as const;

    for (const [width, prefix] of cases) {
      MOCK_WIDTH.current = width;
      const { unmount } = renderShell();

      for (const key of ['learn', 'practice', 'leagues', 'profile']) {
        expect(screen.getByTestId(`${prefix}${key}`)).toBeOnTheScreen();
      }

      unmount();
    }
  });
});
