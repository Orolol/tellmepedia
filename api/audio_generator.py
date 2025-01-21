import torch
from transformers import VitsModel, AutoTokenizer
import scipy.io.wavfile as wavfile
import numpy as np

# Initialize model and tokenizer
model = VitsModel.from_pretrained("facebook/mms-tts-eng")
tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-eng")

if torch.cuda.is_available():
    model = model.to("cuda")

SAMPLE_RATE = 16000  # VITS default sample rate

def generate_audio_file(text, lang='en'):
    print(f"Generating audio file for language: {lang}")
    
    # Tokenize text
    inputs = tokenizer(text, return_tensors="pt")
    if torch.cuda.is_available():
        inputs = {k: v.to("cuda") for k, v in inputs.items()}
    
    # Generate speech
    with torch.no_grad():
        output = model(**inputs).waveform[0]
    
    # Convert to numpy array and normalize
    audio_data = output.cpu().numpy()
    audio_data = (audio_data * 32767).astype(np.int16)  # Convert to 16-bit PCM
    
    # Save as WAV file
    wavfile.write("audio.wav", SAMPLE_RATE, audio_data)
    return "audio.wav"
