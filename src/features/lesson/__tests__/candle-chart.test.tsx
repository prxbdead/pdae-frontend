import { render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

import { CandleChart } from '../components/CandleChart';

const candles = [
  { open: 100, high: 110, low: 95, close: 105 },
  { open: 105, high: 106, low: 90, close: 92 },
  { open: 92, high: 100, low: 91, close: 99 },
];

describe('CandleChart', () => {
  it('renders one candle per data point', () => {
    render(
      <ThemeProvider>
        <CandleChart candles={candles} />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('candle-0')).toBeOnTheScreen();
    expect(screen.getByTestId('candle-1')).toBeOnTheScreen();
    expect(screen.getByTestId('candle-2')).toBeOnTheScreen();
    expect(screen.queryByTestId('candle-3')).toBeNull();
  });

  it('summarizes the chart for screen readers', () => {
    render(
      <ThemeProvider>
        <CandleChart candles={candles} />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText('Chart with 3 candles; open 100, close 99'))
      .toBeOnTheScreen();
  });
});
