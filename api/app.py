from flask import Flask, request, jsonify, send_file
import os
import wikipedia
from urllib.parse import urlparse, unquote
import tempfile
import torch
from bark import SAMPLE_RATE, generate_audio, preload_models
from scipy.io.wavfile import write as write_wav
import warnings
import nltk
from nltk.tokenize import sent_tokenize

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

def generate_audio_file(text, lang='en'):
    print(f"Generating audio file for language: {lang}")
    print("Text:", text)
    
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
    
    speaker = lang_to_speaker.get(lang, 'v2/en_speaker_6')  # Default to English if language not found
    
    audio_array = generate_audio(text, history_prompt=speaker)
    print("Audio file generated")
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        write_wav(temp_file.name, SAMPLE_RATE, audio_array)
        return temp_file.name

def extract_wiki_content(url, lang='en'):
    # Extract the title from the URL and decode it
    path = urlparse(url).path
    title = unquote(path.split('/')[-1])
    
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
    wiki_url = data.get('wiki_url')
    lang = data.get('lang', 'en')  # Default to English if not specified
    
    print(f"Wikipedia URL: {wiki_url}")
    print(f"Language: {lang}")
    
    if not wiki_url:
        return jsonify({"error": "Missing Wikipedia URL"}), 400
    
    content = extract_wiki_content(wiki_url, lang)
    
    if content.startswith("Error:"):
        return jsonify({"error": content}), 400
    
    chunks = split_content_into_chunks(content)
    
    print(f"Nombre de chunks : {len(chunks)}")
    
    audio_files = []
    for i, chunk in enumerate(chunks):
        print(f"Processing chunk {i+1}/{len(chunks)}")
        print(f"Chunk length: {len(chunk)} characters")
        audio_file = generate_audio_file(chunk, lang)
        audio_files.append(audio_file)
    
    print("Audio genérés :", audio_files)
    
    # Fusionner les fichiers audio
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as output_file:
        output_filename = output_file.name
        
    # Utiliser ffmpeg pour concaténer les fichiers audio
    concat_file = 'concat.txt'
    with open(concat_file, 'w') as f:
        for audio_file in audio_files:
            f.write(f"file '{audio_file}'\n")
    
    os.system(f"ffmpeg -f concat -safe 0 -i {concat_file} -c copy {output_filename}")
    
    # Nettoyer les fichiers temporaires
    os.remove(concat_file)
    for audio_file in audio_files:
        os.remove(audio_file)
    
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
