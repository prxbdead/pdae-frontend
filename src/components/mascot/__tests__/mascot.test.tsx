import { fireEvent, render, screen } from '@testing-library/react-native';

import { useSettingsStore } from '@/stores/settingsStore';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { CHARACTERS } from '../types';
import { Mascot } from '../Mascot';

function renderMascot(
  props: Partial<Parameters<typeof Mascot>[0]> = {},
) {
  return render(
    <ThemeProvider>
      <Mascot character="hodlo" mood="idle" {...props} />
    </ThemeProvider>,
  );
}

describe('Mascot', () => {
  it('renders the character name, catchphrase, and mood label', () => {
    renderMascot({ mood: 'celebrate' });

    expect(screen.getByText(CHARACTERS.hodlo.name)).toBeOnTheScreen();
    expect(screen.getByText(CHARACTERS.hodlo.catchphrase)).toBeOnTheScreen();
    expect(screen.getByLabelText('Hodlo, celebrate')).toBeOnTheScreen();
  });

  it('becomes a button when onPress is provided', () => {
    const onPress = jest.fn();
    renderMascot({ onPress });

    fireEvent.press(screen.getByLabelText('Hodlo, idle'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not render press semantics without onPress', () => {
    renderMascot();

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders statically when reduced motion is on', () => {
    useSettingsStore.setState({ reducedMotion: true });

    renderMascot({ character: 'vex', mood: 'shock' });

    expect(screen.getByText('Vex')).toBeOnTheScreen();
    expect(screen.getByLabelText('Vex, shock')).toBeOnTheScreen();
  });
});
