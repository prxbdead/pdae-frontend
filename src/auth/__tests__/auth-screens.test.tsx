import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { mockUser } from '@/api/fixtures';
import { ApiError } from '@/api/errors';
import { useSessionStore } from '@/auth/sessionStore';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { routerMock } from '@/testing/expo-router-mock';
import { apiMock, resetApiMock } from '@/testing/api-mock';

import LoginScreen from '../../../app/(auth)/login';
import RegisterScreen from '../../../app/(auth)/register';

jest.mock('expo-router', () => require('@/testing/expo-router-mock'));
jest.mock('@/api/ApiProvider', () => require('@/testing/api-mock'));

function renderScreen(node: React.ReactElement) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

beforeEach(() => {
  resetApiMock();
  routerMock.replace.mockClear();
  routerMock.push.mockClear();
  useSessionStore.setState({
    status: 'anonymous',
    user: null,
    lastValidatedAt: null,
    isOffline: false,
    returnTo: null,
  });
});

describe('LoginScreen', () => {
  it('shows validation messages for empty fields', async () => {
    renderScreen(<LoginScreen />);

    fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByText('Enter a valid email')).toBeOnTheScreen();
    expect(await screen.findByText('Password is required')).toBeOnTheScreen();
  });

  it('shows the API message when credentials are rejected', async () => {
    apiMock.client.auth.login = jest
      .fn()
      .mockRejectedValue(new ApiError('Invalid email or password', 401));
    renderScreen(<LoginScreen />);

    fireEvent.changeText(screen.getByTestId('login-email'), 'learner@hodlo.app');
    fireEvent.changeText(screen.getByTestId('login-password'), 'wrongpass');
    fireEvent.press(screen.getByTestId('login-submit'));

    expect(
      await screen.findByText('Invalid email or password'),
    ).toBeOnTheScreen();
  });

  it('signs in and replaces the route on success', async () => {
    const signIn = jest
      .spyOn(useSessionStore.getState(), 'signIn')
      .mockResolvedValue(undefined);
    apiMock.client.auth.login = jest.fn().mockResolvedValue(mockUser);
    renderScreen(<LoginScreen />);

    fireEvent.changeText(screen.getByTestId('login-email'), mockUser.email);
    fireEvent.changeText(screen.getByTestId('login-password'), 'password123');
    fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() => expect(signIn).toHaveBeenCalledWith(mockUser));
    expect(routerMock.replace).toHaveBeenCalledWith('/(tabs)/learn');
  });

  it('returns to the saved route after sign-in', async () => {
    jest
      .spyOn(useSessionStore.getState(), 'signIn')
      .mockResolvedValue(undefined);
    useSessionStore.setState({ returnTo: '/lesson/foundations-1' });
    apiMock.client.auth.login = jest.fn().mockResolvedValue(mockUser);
    renderScreen(<LoginScreen />);

    fireEvent.changeText(screen.getByTestId('login-email'), mockUser.email);
    fireEvent.changeText(screen.getByTestId('login-password'), 'password123');
    fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith(
        '/lesson/foundations-1',
      ),
    );
  });

  it('navigates to onboarding from the start link', () => {
    renderScreen(<LoginScreen />);

    fireEvent.press(screen.getByTestId('start-onboarding'));

    expect(routerMock.push).toHaveBeenCalledWith('/onboarding');
  });
});

describe('RegisterScreen', () => {
  it('rejects a short password', async () => {
    renderScreen(<RegisterScreen />);

    fireEvent.changeText(screen.getByTestId('register-display-name'), 'Robin');
    fireEvent.changeText(screen.getByTestId('register-email'), 'robin@hodlo.app');
    fireEvent.changeText(screen.getByTestId('register-password'), 'short');
    fireEvent.changeText(screen.getByTestId('register-confirm'), 'short');
    fireEvent.press(screen.getByTestId('register-submit'));

    expect(
      await screen.findByText('Password must be at least 8 characters'),
    ).toBeOnTheScreen();
  });

  it('rejects mismatched passwords', async () => {
    renderScreen(<RegisterScreen />);

    fireEvent.changeText(screen.getByTestId('register-display-name'), 'Robin');
    fireEvent.changeText(screen.getByTestId('register-email'), 'robin@hodlo.app');
    fireEvent.changeText(screen.getByTestId('register-password'), 'password123');
    fireEvent.changeText(screen.getByTestId('register-confirm'), 'password124');
    fireEvent.press(screen.getByTestId('register-submit'));

    expect(
      await screen.findByText('Passwords do not match'),
    ).toBeOnTheScreen();
  });
});
