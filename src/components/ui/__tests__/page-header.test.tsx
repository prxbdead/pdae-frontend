import { render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

import { PageHeader } from '../PageHeader';

function renderHeader(tier: 'compact' | 'standard' | 'hero') {
  return render(
    <ThemeProvider>
      <PageHeader title="Learn" tier={tier} />
    </ThemeProvider>,
  );
}

describe('PageHeader', () => {
  it.each([
    ['compact', 56],
    ['standard', 88],
    ['hero', 160],
  ] as const)('renders the %s tier at %i px', (tier, height) => {
    renderHeader(tier);

    const header = screen.getByTestId('page-header');
    const style = Array.isArray(header.props.style)
      ? Object.assign({}, ...header.props.style)
      : header.props.style;

    expect(style.height).toBe(height);
  });

  it('keeps the title container at the same offset in every tier', () => {
    for (const tier of ['compact', 'standard', 'hero'] as const) {
      const { unmount } = renderHeader(tier);
      const title = screen.getByTestId('page-header-title');
      const style = Array.isArray(title.props.style)
        ? Object.assign({}, ...title.props.style)
        : title.props.style;

      expect(style.position).toBe('absolute');
      expect(style.bottom).toBe(16);

      unmount();
    }
  });

  it('renders a back control when onBack is provided', () => {
    render(
      <ThemeProvider>
        <PageHeader title="Lesson" tier="compact" onBack={jest.fn()} />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText('Go back')).toBeOnTheScreen();
  });

  it('renders right-side content', () => {
    render(
      <ThemeProvider>
        <PageHeader
          title="Learn"
          tier="standard"
          right={<></>}
          artwork={<></>}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText('Learn')).toBeOnTheScreen();
  });
});
