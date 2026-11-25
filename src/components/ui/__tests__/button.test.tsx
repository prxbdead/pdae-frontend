import { fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

import { Button } from '../Button';

function renderButton(props: Parameters<typeof Button>[0]) {
  return render(
    <ThemeProvider>
      <Button {...props} />
    </ThemeProvider>,
  );
}

describe('Button', () => {
  it('renders its label and fires onPress', () => {
    const onPress = jest.fn();
    renderButton({ label: 'Start lesson', onPress });

    fireEvent.press(screen.getByRole('button'));

    expect(screen.getByText('Start lesson')).toBeOnTheScreen();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes the button role and state', () => {
    renderButton({ label: 'Continue', onPress: jest.fn() });

    const button = screen.getByRole('button');

    expect(button.props.accessibilityState).toMatchObject({
      disabled: false,
      busy: false,
    });
  });

  it('does not fire when disabled', () => {
    const onPress = jest.fn();
    renderButton({ label: 'Continue', onPress, disabled: true });

    fireEvent.press(screen.getByRole('button'));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it('does not fire while loading', () => {
    const onPress = jest.fn();
    renderButton({ label: 'Continue', onPress, loading: true });

    fireEvent.press(screen.getByRole('button'));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button').props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
  });

  it('renders an icon when asked', () => {
    renderButton({ label: 'Play', onPress: jest.fn(), icon: 'play' });

    expect(screen.getByTestId('button-icon')).toBeOnTheScreen();
  });
});
