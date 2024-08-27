from flask import Flask, request, jsonify, send_file
import os
os.environ["SUNO_OFFLOAD_CPU"] = "True"
os.environ["SUNO_USE_SMALL_MODELS"] = "True"

import wikipedia
import tempfile
import torch
from bark import SAMPLE_RATE, generate_audio, preload_models, generate_text_semantic, semantic_to_waveform
from scipy.io.wavfile import write as write_wav
import numpy as np
import warnings
import nltk
from nltk.tokenize import sent_tokenize
from dotenv import load_dotenv

load_dotenv()



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
        'fr': 'v2/fr_speaker_5',
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
        semantic_tokens = generate_text_semantic(
            sentence,
            history_prompt=SPEAKER,
            temp=GEN_TEMP,
            min_eos_p=0.05,  # this controls how likely the generation is to end
        )

        audio_array = semantic_to_waveform(semantic_tokens, history_prompt=SPEAKER)
        pieces += [audio_array, silence.copy()]

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
        page = wikipedia.page(title)
        return page.content
    except wikipedia.exceptions.DisambiguationError as e:
        return f"Error: Ambiguous page. Possible options: {e.options}"
    except wikipedia.exceptions.PageError:
        return "Error: Page not found"

def split_content_into_chunks(content):
    nltk.download('punkt', quiet=True)
    sentences = sent_tokenize(content)
    return sentences

@app.route('/generate_audio', methods=['POST'])
def generate_audio_from_wiki():
    data = request.json
    title = data.get('title')
    lang = data.get('lang', 'en')  # Default to English if not specified
    
    print(f"Wikipedia Title: {title}")
    print(f"Language: {lang}")
    
    if not title:
        return jsonify({"error": "Missing Wikipedia page title"}), 400
    
    content = extract_wiki_content(title, lang)
    
    if content.startswith("Error:"):
        return jsonify({"error": content}), 400
    
    sentences = split_content_into_chunks(content)
    
    print(f"Nombre de phrases : {len(sentences)}")
    
    output_filename = generate_audio_file(sentences, lang)
    
    print("Audio fusionné généré :", output_filename)
    
    # Envoyer le fichier audio fusionné
    response = send_file(output_filename, mimetype='audio/wav', as_attachment=True, download_name='wiki_audio.wav')
    
    # Ajouter le nom du fichier temporaire à la réponse pour le nettoyage
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
