from flask import Flask, request, jsonify, send_file
import os
import wikipedia
from urllib.parse import urlparse
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

# Check for GPU availability
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

print("Preloading Bark models")
# Preload Bark models
preload_models()

print("Bark models preloaded")

def generate_audio_file(text):
    print("Generating audio file")
    audio_array = generate_audio(text)
    print("Audio file generated")
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        write_wav(temp_file.name, SAMPLE_RATE, audio_array)
        return temp_file.name

def extract_wiki_content(url):
    # Extraire le titre de la page à partir de l'URL
    path = urlparse(url).path
    title = path.split('/')[-1]
    
    try:
        # Récupérer le contenu complet de la page Wikipédia
        page = wikipedia.page(title)
        return page.content
    except wikipedia.exceptions.DisambiguationError as e:
        return f"Erreur : Page ambiguë. Options possibles : {e.options}"
    except wikipedia.exceptions.PageError:
        return "Erreur : Page non trouvée"

def split_content_into_chunks(content, max_chunk_size=2000):
    nltk.download('punkt', quiet=True)
    sentences = sent_tokenize(content)
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_chunk_size:
            current_chunk += sentence + " "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

@app.route('/generate_audio', methods=['POST'])
def generate_audio_from_wiki():
    data = request.json
    wiki_url = data.get('wiki_url')
    
    print(wiki_url)
    
    if not wiki_url:
        return jsonify({"error": "URL Wikipedia manquante"}), 400
    
    content = extract_wiki_content(wiki_url)
    
    if content.startswith("Erreur :"):
        return jsonify({"error": content}), 400
    
    chunks = split_content_into_chunks(content)
    
    print(f"Nombre de chunks : {len(chunks)}")
    
    audio_files = []
    for i, chunk in enumerate(chunks):
        print(f"Traitement du chunk {i+1}/{len(chunks)}")
        print(f"Longueur du chunk : {len(chunk)} caractères")
        audio_file = generate_audio_file(chunk)
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
