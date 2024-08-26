from flask import Flask, request, jsonify, send_file
import os
import wikipedia
from urllib.parse import urlparse
import tempfile
import torch
from bark import SAMPLE_RATE, generate_audio, preload_models
from scipy.io.wavfile import write as write_wav
import warnings

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
    audio_array = generate_audio(text)
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        write_wav(temp_file.name, SAMPLE_RATE, audio_array)
        return temp_file.name

def extract_wiki_content(url):
    # Extraire le titre de la page à partir de l'URL
    path = urlparse(url).path
    title = path.split('/')[-1]
    
    try:
        # Récupérer le contenu de la page Wikipédia
        page = wikipedia.page(title)
        return page.content
    except wikipedia.exceptions.DisambiguationError as e:
        return f"Erreur : Page ambiguë. Options possibles : {e.options}"
    except wikipedia.exceptions.PageError:
        return "Erreur : Page non trouvée"

@app.route('/generate_audio', methods=['POST'])
def generate_audio():
    data = request.json
    wiki_url = data.get('wiki_url')
    
    print(wiki_url)
    
    if not wiki_url:
        return jsonify({"error": "URL Wikipedia manquante"}), 400
    
    content = extract_wiki_content(wiki_url)
    
    print("Contenu extrait :", content)
    
    # Générer l'audio à partir du contenu extrait
    audio_file = generate_audio_file(content)
    
    print("Audio generated :", audio_file)
    
    # Envoyer le fichier audio
    return send_file(audio_file, mimetype='audio/wav', as_attachment=True, download_name='wiki_audio.wav')

@app.after_request
def cleanup(response):
    # Supprimer le fichier temporaire après l'envoi
    if response.headers.get('Content-Disposition'):
        filename = response.headers['Content-Disposition'].split('filename=')[1].strip('"')
        os.remove(filename)
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
