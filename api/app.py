from flask import Flask, request, jsonify, send_file
import os
import pathlib
os.environ["SUNO_OFFLOAD_CPU"] = "True"
os.environ["SUNO_USE_SMALL_MODELS"] = "False"

import wikipedia
import tempfile
import hashlib
import torch
from bark import SAMPLE_RATE, generate_audio, preload_models, semantic_to_waveform
from scipy.io.wavfile import write as write_wav
import numpy as np
import warnings
import nltk
from nltk.tokenize import sent_tokenize
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def get_safe_filename(title, lang):
    safe_title = "".join([c for c in title if c.isalnum() or c in (' ', '-', '_')]).rstrip()
    return f"{safe_title}_{lang}"

def save_text(content, filename):
    filepath = pathlib.Path("saved_texts") / f"{filename}.txt"
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def save_audio(audio_file, filename):
    filepath = pathlib.Path("saved_audio") / f"{filename}.wav"
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "wb") as f:
        with open(audio_file, "rb") as source_file:
            f.write(source_file.read())

def load_audio(filename):
    filepath = pathlib.Path("saved_audio") / f"{filename}.wav"
    if filepath.exists():
        return str(filepath)
    return None

def load_text(filename):
    filepath = pathlib.Path("saved_texts") / f"{filename}.txt"
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    return None

# Initialize the OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))



app = Flask(__name__)

# Suppress specific warnings
warnings.filterwarnings("ignore", category=FutureWarning)

nltk.download('punkt_tab')

# Check for GPU availability
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

print("Preloading Bark models")
# Preload Bark models
preload_models()

print("Bark models preloaded")

def generate_audio_file(sentences, lang='en'):
    print(f"Generating audio file for language: {lang}")
    
    # Map language codes to Bark's speaker presets
    lang_to_speaker = {
        'en': 'v2/en_speaker_6',
        'fr': 'v2/fr_speaker_1',
        'de': 'v2/de_speaker_6',
        'es': 'v2/es_speaker_6',
        'it': 'v2/it_speaker_7',
        'ja': 'v2/ja_speaker_5',
        'zh': 'v2/zh_speaker_5',
        # Add more languages and corresponding speaker presets as needed
    }
    
    SPEAKER = lang_to_speaker.get(lang, 'v2/en_speaker_6')  # Default to English if language not found
    GEN_TEMP = 0.6
    silence = np.zeros(int(0.25 * SAMPLE_RATE))  # quarter second of silence

    pieces = []
    for sentence in sentences:
        print(f"Processing sentence: {sentence}")
        test_audio = generate_audio(
            sentence,
            history_prompt=SPEAKER,
            text_temp=GEN_TEMP,
        )

        # silence_audio = semantic_to_waveform(silence.copy(), history_prompt=SPEAKER)
        pieces += [test_audio, silence]

    # Concatenate all audio pieces
    final_audio = np.concatenate(pieces)
    
    print("Audio file generated")
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        write_wav(temp_file.name, SAMPLE_RATE, final_audio)
        return temp_file.name

def extract_wiki_content(title, lang='en'):
    try:
        # Set the language for Wikipedia
        wikipedia.set_lang(lang)
        
        # Get the full content of the Wikipedia page
        page = wikipedia.page(title, auto_suggest=False)
        
        return page.content
    except wikipedia.exceptions.DisambiguationError as e:
        return f"Error: Ambiguous page. Possible options: {e.options}"
    except wikipedia.exceptions.PageError:
        return "Error: Page not found"

def split_content_into_chunks(content):
    nltk.download('punkt', quiet=True)
    sentences = sent_tokenize(content)
    return sentences

def rewrite_content_with_gpt4(content):
    prompt = f"""Rewrite the following Wikipedia content:

{content}

Instructions:
Make the text more suitable for oral reading, and more entertaining to listen.
Make the text more informative and engaging, like a podcast or a documentary.
Preserve all the information and details. Preserve original text language
Make the sentences maximum 30 words long. If a sentences is too long, break it into multiple sentences. 
If a category of chapter seems empty, remove it.
Do not include wikipedia specific categories, like see also, or other references.

Original Article :"""

    response = client.chat.completions.create(
        model="gpt-4o-2024-08-06",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that rewrites Wikipedia content for audio narration."},
            {"role": "user", "content": prompt}
        ],
        n=1,
        temperature=0.7,
    )

    return response.choices[0].message.content.strip()

@app.route('/generate_audio', methods=['POST'])
def generate_audio_from_wiki():
    data = request.json
    title = data.get('title')
    lang = data.get('lang', 'en')  # Default to English if not specified
    size = data.get('size', 0)  # Default to 0 (full article) if not specified
    force_regenerate = data.get('force_regenerate', False)
    
    print(f"Wikipedia Title: {title}")
    print(f"Language: {lang}")
    print(f"Size: {size}")
    print(f"Force Regenerate: {force_regenerate}")
    
    if not title:
        return jsonify({"error": "Missing Wikipedia page title"}), 400
    
    safe_filename = get_safe_filename(title, lang)
    
    if not force_regenerate:
        existing_audio = load_audio(safe_filename)
        if existing_audio:
            print("Using existing audio file")
            return send_file(existing_audio, mimetype='audio/wav', as_attachment=True, download_name='wiki_audio.wav')
    
    existing_text = load_text(safe_filename)
    if existing_text and not force_regenerate:
        print("Using existing text content")
        content = existing_text
    else:
        content = extract_wiki_content(title, lang)
        if content.startswith("Error:"):
            return jsonify({"error": content}), 400
        save_text(content, safe_filename)
    
    # Rewrite content using GPT-4
    rewritten_content = rewrite_content_with_gpt4(content)
    save_text(rewritten_content, f"{safe_filename}_rewritten")
    
    sentences = split_content_into_chunks(rewritten_content)
    
    if size > 0:
        sentences = sentences[:size]
    
    print(f"Nombre de phrases : {len(sentences)}")
    
    output_filename = generate_audio_file(sentences, lang)
    
    print("Audio fusionné généré :", output_filename)
    
    save_audio(output_filename, safe_filename)

    response = send_file(output_filename, mimetype='audio/wav', as_attachment=True, download_name='wiki_audio.wav')
    response.headers['X-Temp-File'] = output_filename
    
    return response

@app.after_request
def cleanup(response):
    # Supprimer le fichier temporaire après l'envoi
    temp_file = response.headers.get('X-Temp-File')
    if temp_file and os.path.exists(temp_file):
        os.remove(temp_file)
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
