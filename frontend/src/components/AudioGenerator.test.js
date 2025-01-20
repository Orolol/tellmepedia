import { render, screen, fireEvent } from '@testing-library/react';
import AudioGenerator from './AudioGenerator';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { filename: 'test.wav' } }))
}));

describe('AudioGenerator', () => {
  test('renders form elements', () => {
    render(<AudioGenerator />);
    expect(screen.getByPlaceholderText(/Paste Wikipedia URL/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Wikipedia Article Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate Audio/i)).toBeInTheDocument();
  });

  test('handles URL input', () => {
    render(<AudioGenerator />);
    const urlInput = screen.getByPlaceholderText(/Paste Wikipedia URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://en.wikipedia.org/wiki/Test' } });
    expect(urlInput.value).toBe('https://en.wikipedia.org/wiki/Test');
  });

  test('handles language selection', () => {
    render(<AudioGenerator />);
    const langSelect = screen.getByRole('combobox');
    fireEvent.change(langSelect, { target: { value: 'fr' } });
    expect(langSelect.value).toBe('fr');
  });
});
