import { fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';

import { ThemeProvider } from '../ThemeProvider';
import { useTheme } from '../useTheme';

function Probe() {
  const theme = useTheme();

  return (
    <>
      <Text testID="background">{theme.colors.background}</Text>
      <Text testID="mode">{theme.mode}</Text>
      <Text testID="display-size">{String(theme.typography.display.fontSize)}</Text>
      <Pressable testID="go-dark" onPress={() => theme.setMode('dark')} />
    </>
  );
}

function renderProbe() {
  return render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  useSettingsStore.setState({ themeMode: 'system' });
});

describe('ThemeProvider', () => {
  it('resolves the light theme when the system has no preference', () => {
    renderProbe();

    expect(screen.getByTestId('background')).toHaveTextContent('#F5F2FF');
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('display-size')).toHaveTextContent('40');
  });

  it('honours an explicit dark setting', () => {
    useSettingsStore.setState({ themeMode: 'dark' });
    renderProbe();

    expect(screen.getByTestId('background')).toHaveTextContent('#120D24');
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('switches theme and stores the choice', () => {
    renderProbe();

    fireEvent.press(screen.getByTestId('go-dark'));

    expect(useSettingsStore.getState().themeMode).toBe('dark');
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('throws when used outside the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow(/ThemeProvider/);

    jest.restoreAllMocks();
  });
});
