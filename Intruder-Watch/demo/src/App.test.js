 import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn reactlink', () => {
  render(<App />);
  const linkElement = screen.get ByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
