import unittest
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from audio_generator import generate_audio_file

class TestAudioGenerator(unittest.TestCase):
    def setUp(self):
        # Clean up any existing audio files
        if os.path.exists("audio.wav"):
            os.remove("audio.wav")
    
    def tearDown(self):
        # Clean up after tests
        if os.path.exists("audio.wav"):
            os.remove("audio.wav")
    
    def test_generate_audio_file(self):
        # Test with a simple text
        text = "Hello, this is a test."
        output_file = generate_audio_file(text)
        
        # Check if file was created
        self.assertTrue(os.path.exists(output_file))
        
        # Check if file is not empty
        self.assertGreater(os.path.getsize(output_file), 0)
    
    def test_generate_audio_file_with_lang(self):
        # Test with language parameter
        text = "Hello, this is a test."
        output_file = generate_audio_file(text, lang='en')
        
        # Check if file was created
        self.assertTrue(os.path.exists(output_file))
        
        # Check if file is not empty
        self.assertGreater(os.path.getsize(output_file), 0)

if __name__ == '__main__':
    unittest.main()
