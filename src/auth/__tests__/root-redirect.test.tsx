import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { useSessionStore } from '@/auth/sessionStore';
import { useRootRedirect } from '@/auth/rootRedirect';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { mockUser } from '@/api/fixtures';
import {
  routerMock,
  setPathname,
  setSegments,
} from '@/testing/expo-router-mock';

jest.mock('expo-router', () => require('@/testing/expo-router-mock'));

function Probe() {
  useRootRedirect();

  return <Text>probe</Text>;
}

function renderProbe(options: {
  status: 'loading' | 'authenticated' | 'anonymous';
  onboarding: boolean;
  pathname: string;
  segments: string[];
}) {
  useSessionStore.setState({
    status: options.status,
    user: options.status === 'authenticated' ? mockUser : null,
  });
  useOnboardingStore.setState({ completed: options.onboarding });
  setPathname(options.pathname);
  setSegments(options.segments);

  return render(<Probe />);
}

beforeEach(() => {
  routerMock.replace.mockClear();
});

describe('useRootRedirect', () => {
  it('does not redirect while the session is loading', () => {
    renderProbe({
      status: 'loading',
      onboarding: false,
      pathname: '/learn',
      segments: ['(tabs)', 'learn'],
    });

    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('sends a fresh anonymous visitor to onboarding', () => {
    renderProbe({
      status: 'anonymous',
      onboarding: false,
      pathname: '/learn',
      segments: ['(tabs)', 'learn'],
    });

    expect(routerMock.replace).toHaveBeenCalledWith('/onboarding');
  });

  it('sends a returning anonymous visitor to login with returnTo', () => {
    renderProbe({
      status: 'anonymous',
      onboarding: true,
      pathname: '/learn',
      segments: ['(tabs)', 'learn'],
    });

    expect(useSessionStore.getState().returnTo).toBe('/learn');
    expect(routerMock.replace).toHaveBeenCalledWith('/login');
  });

  it('sends an authenticated visitor with incomplete onboarding to onboarding', () => {
    renderProbe({
      status: 'authenticated',
      onboarding: false,
      pathname: '/learn',
      segments: ['(tabs)', 'learn'],
    });

    expect(routerMock.replace).toHaveBeenCalledWith('/onboarding');
  });

  it('leaves an authenticated visitor on the Learn path', () => {
    renderProbe({
      status: 'authenticated',
      onboarding: true,
      pathname: '/learn',
      segments: ['(tabs)', 'learn'],
    });

    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('moves an onboarded user out of auth routes', () => {
    renderProbe({
      status: 'authenticated',
      onboarding: true,
      pathname: '/login',
      segments: ['(auth)', 'login'],
    });

    expect(routerMock.replace).toHaveBeenCalledWith('/(tabs)/learn');
  });

  it('leaves the auth flow alone for anonymous visitors', () => {
    renderProbe({
      status: 'anonymous',
      onboarding: false,
      pathname: '/login',
      segments: ['(auth)', 'login'],
    });

    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('moves an onboarded user off the splash route', () => {
    renderProbe({
      status: 'authenticated',
      onboarding: true,
      pathname: '/',
      segments: [],
    });

    expect(routerMock.replace).toHaveBeenCalledWith('/(tabs)/learn');
  });
});
