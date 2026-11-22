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
  it('keeps submit disabled until both fields are valid', async () => {
    renderScreen(<LoginScreen />);

    expect(screen.getByTestId('login-submit')).toBeDisabled();

    fireEvent.changeText(screen.getByTestId('login-email'), 'not-an-email');
    expect(await screen.findByText('Enter a valid email')).toBeOnTheScreen();
    expect(screen.getByTestId('login-submit')).toBeDisabled();

    fireEvent.changeText(
      screen.getByTestId('login-email'),
      'learner@hodlo.app',
    );
    fireEvent.changeText(
      screen.getByTestId('login-password'),
      'password123',
    );

    await waitFor(() =>
      expect(screen.getByTestId('login-submit')).toBeEnabled(),
    );
  });

  it('shows the API message when credentials are rejected', async () => {
    apiMock.client.auth.login = jest
      .fn()
      .mockRejectedValue(new ApiError('Invalid email or password', 401));
    renderScreen(<LoginScreen />);

    fireEvent.changeText(screen.getByTestId('login-email'), 'learner@hodlo.app');
    fireEvent.changeText(screen.getByTestId('login-password'), 'wrongpass');
    await waitFor(() =>
      expect(screen.getByTestId('login-submit')).toBeEnabled(),
    );
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
    await waitFor(() =>
      expect(screen.getByTestId('login-submit')).toBeEnabled(),
    );
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
    await waitFor(() =>
      expect(screen.getByTestId('login-submit')).toBeEnabled(),
    );
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
  it('rejects a short password and keeps submit disabled', async () => {
    renderScreen(<RegisterScreen />);

    fireEvent.changeText(screen.getByTestId('register-display-name'), 'Robin');
    fireEvent.changeText(screen.getByTestId('register-email'), 'robin@hodlo.app');
    fireEvent.changeText(screen.getByTestId('register-password'), 'short');
    fireEvent.changeText(screen.getByTestId('register-confirm'), 'short');

    expect(
      await screen.findByText('Password must be at least 8 characters'),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('register-submit')).toBeDisabled();
  });

  it('rejects mismatched passwords', async () => {
    renderScreen(<RegisterScreen />);

    fireEvent.changeText(screen.getByTestId('register-display-name'), 'Robin');
    fireEvent.changeText(screen.getByTestId('register-email'), 'robin@hodlo.app');
    fireEvent.changeText(screen.getByTestId('register-password'), 'password123');
    fireEvent.changeText(screen.getByTestId('register-confirm'), 'password124');

    expect(
      await screen.findByText('Passwords do not match'),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('register-submit')).toBeDisabled();
  });

  it('returns to login without requiring history', () => {
    renderScreen(<RegisterScreen />);

    fireEvent.press(screen.getByTestId('register-login-link'));

    expect(routerMock.replace).toHaveBeenCalledWith('/login');
  });

  it('requires the terms checkbox before enabling submit', async () => {
    renderScreen(<RegisterScreen />);

    fireEvent.changeText(screen.getByTestId('register-display-name'), 'Robin');
    fireEvent.changeText(screen.getByTestId('register-email'), 'robin@hodlo.app');
    fireEvent.changeText(screen.getByTestId('register-password'), 'password123');
    fireEvent.changeText(screen.getByTestId('register-confirm'), 'password123');

    await waitFor(() =>
      expect(screen.getByTestId('register-terms')).toBeTruthy(),
    );
    expect(screen.getByTestId('register-submit')).toBeDisabled();

    fireEvent.press(screen.getByTestId('register-terms'));

    await waitFor(() =>
      expect(screen.getByTestId('register-submit')).toBeEnabled(),
    );
  });
});
