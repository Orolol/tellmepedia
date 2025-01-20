import { render, screen } from '@testing-library/react';
import AudioPlayer from './AudioPlayer';

describe('AudioPlayer', () => {
  test('renders no audio message when no file is selected', () => {
    render(<AudioPlayer />);
    expect(screen.getByText(/No audio selected/i)).toBeInTheDocument();
  });

  test('renders player when audio file is provided', () => {
    const mockAudio = {
      title: 'Test Audio',
      filename: 'test.wav',
      lang: 'en'
    };
    render(<AudioPlayer currentlyPlaying={mockAudio} />);
    expect(screen.getByText(/Test Audio/i)).toBeInTheDocument();
  });
});