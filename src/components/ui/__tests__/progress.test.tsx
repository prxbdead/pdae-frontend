import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { ThemeProvider } from '@/theme/ThemeProvider';

import { ProgressBar } from '../ProgressBar';
import { ProgressRing } from '../ProgressRing';

function renderWithTheme(node: ReactElement) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

describe('ProgressBar', () => {
  it('exposes the progressbar role with a clamped value', () => {
    renderWithTheme(
      <ProgressBar value={150} max={100} label="Lesson progress" />,
    );

    const bar = screen.getByRole('progressbar');

    expect(bar.props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 100,
    });
  });

  it('clamps below zero', () => {
    renderWithTheme(<ProgressBar value={-20} max={10} />);

    expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({
      min: 0,
      max: 10,
      now: 0,
    });
  });

  it('renders an optional label', () => {
    renderWithTheme(<ProgressBar value={2} max={5} label="2 of 5" />);

    expect(screen.getByText('2 of 5')).toBeOnTheScreen();
  });
});

describe('ProgressRing', () => {
  it('renders an svg ring and its label', () => {
    render(
      <ThemeProvider>
        <ProgressRing value={0.5} label="50%" />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('progress-ring')).toBeOnTheScreen();
    expect(screen.getByText('50%')).toBeOnTheScreen();
  });

  it('clamps the reported value', () => {
    render(
      <ThemeProvider>
        <ProgressRing value={2} label="done" />
      </ThemeProvider>,
    );

    expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({
      min: 0,
      max: 1,
      now: 1,
    });
  });
});
