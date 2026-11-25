import { render, screen } from '@testing-library/react-native';

import { ICON_NAMES, type IconName } from '@/assets/icons';

import { Icon } from '../Icon';

describe('Icon', () => {
  it.each(ICON_NAMES)('renders the "%s" icon', name => {
    render(<Icon name={name} testID="icon" />);

    expect(screen.getByTestId('icon')).toBeOnTheScreen();
  });

  it('keeps original artwork at the requested size', () => {
    render(<Icon name="heart" color="#FF5A6E" size={32} testID="icon" />);

    const icon = screen.getByTestId('icon');

    expect(icon.props.style).toEqual(
      expect.objectContaining({ width: 32, height: 32 }),
    );
  });

  it('still applies semantic colors to the custom line icons', () => {
    render(<Icon name="close" color="#FF5A6E" size={32} testID="icon" />);

    const icon = screen.getByTestId('icon');

    expect(icon.props.width).toBe(32);
    expect(icon.props.height).toBe(32);
    expect(icon.props.stroke).toBe('#FF5A6E');
  });

  it('warns once for an unknown icon and renders a neutral dot', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<Icon name={'definitely-not-an-icon' as IconName} testID="unknown" />);
    render(<Icon name={'definitely-not-an-icon' as IconName} testID="unknown-2" />);

    expect(screen.getByTestId('unknown-2')).toBeOnTheScreen();
    expect(warn).toHaveBeenCalledTimes(1);

    warn.mockRestore();
  });
});
