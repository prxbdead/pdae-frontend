import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { useSessionStore } from '@/auth/sessionStore';
import { useRootRedirect } from '@/auth/rootRedirect';
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
  pathname: string;
  segments: string[];
}) {
  useSessionStore.setState({
    status: options.status,
    user: options.status === 'authenticated' ? mockUser : null,
    returnTo: null,
  });
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
      pathname: '/learn',
      segments: ['(tabs)', 'learn'],
    });

    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('sends an anonymous visitor to login with returnTo', () => {
    renderProbe({
      status: 'anonymous',
      pathname: '/learn',
      segments: ['(tabs)', 'learn'],
    });

    expect(useSessionStore.getState().returnTo).toBe('/learn');
    expect(routerMock.replace).toHaveBeenCalledWith('/login');
  });

  it('sends the anonymous landing route to login without returnTo', () => {
    renderProbe({
      status: 'anonymous',
      pathname: '/',
      segments: [],
    });

    expect(useSessionStore.getState().returnTo).toBeNull();
    expect(routerMock.replace).toHaveBeenCalledWith('/login');
  });

  it('leaves the auth flow alone for anonymous visitors', () => {
    renderProbe({
      status: 'anonymous',
      pathname: '/login',
      segments: ['(auth)', 'login'],
    });

    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('leaves an authenticated visitor on the Learn path', () => {
    renderProbe({
      status: 'authenticated',
      pathname: '/learn',
      segments: ['(tabs)', 'learn'],
    });

    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('moves an authenticated user out of auth routes', () => {
    renderProbe({
      status: 'authenticated',
      pathname: '/login',
      segments: ['(auth)', 'login'],
    });

    expect(routerMock.replace).toHaveBeenCalledWith('/(tabs)/learn');
  });

  it('moves an authenticated user off the splash route', () => {
    renderProbe({
      status: 'authenticated',
      pathname: '/',
      segments: [],
    });

    expect(routerMock.replace).toHaveBeenCalledWith('/(tabs)/learn');
  });
});
