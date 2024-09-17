from styletts2 import tts

mytts = tts.StyleTTS2()
SAMPLE_RATE = 22050  # StyleTTS2 default sample rate

def generate_audio_file(text, lang='en'):
    print(f"Generating audio file for language: {lang}")
    mytts.inference(text, output_sample_rate=SAMPLE_RATE, diffusion_steps=5, embedding_scale=1, output_wav_file="audio.wav")
    return "audio.wav"
