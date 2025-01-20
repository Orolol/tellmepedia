import { render, screen } from '@testing-library/react';
import App from './App';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: { filename: 'test.wav' } }))
}));

test('renders main app components', () => {
  render(<App />);
  expect(screen.getByText(/TellMePedia/i)).toBeInTheDocument();
});
