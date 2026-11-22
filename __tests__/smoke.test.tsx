import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

it('renders a themed label', () => {
  render(<Text>Hodlo</Text>);
  expect(screen.getByText('Hodlo')).toBeOnTheScreen();
});
