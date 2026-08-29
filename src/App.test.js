import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the dashboard heading', () => {
  render(<App />);
  const heading = screen.getByText(/crack movement analysis dashboard/i);
  expect(heading).toBeInTheDocument();
});
