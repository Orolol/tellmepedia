from flask import Flask, request, jsonify, send_file
import os
import wikipedia
from urllib.parse import urlparse
from gtts import gTTS
import tempfile

app = Flask(__name__)

def generate_audio_file(text, lang='fr'):
    tts = gTTS(text=text, lang=lang)
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
        tts.save(temp_file.name)
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
    
    if not wiki_url:
        return jsonify({"error": "URL Wikipedia manquante"}), 400
    
    content = extract_wiki_content(wiki_url)
    
    # Générer l'audio à partir du contenu extrait
    audio_file = generate_audio_file(content)
    
    # Envoyer le fichier audio
    return send_file(audio_file, mimetype='audio/mp3', as_attachment=True, download_name='wiki_audio.mp3')

@app.after_request
def cleanup(response):
    # Supprimer le fichier temporaire après l'envoi
    if response.headers.get('Content-Disposition'):
        filename = response.headers['Content-Disposition'].split('filename=')[1].strip('"')
        os.remove(filename)
    return response

if __name__ == '__main__':
    app.run(debug=True)
