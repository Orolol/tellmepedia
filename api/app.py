from flask import Flask, request, jsonify
import os
import wikipedia
from urllib.parse import urlparse

app = Flask(__name__)

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
    
    # Pour l'instant, nous retournons le contenu extrait
    # Plus tard, nous ajouterons ici la logique pour générer l'audio
    return jsonify({"content": content}), 200

if __name__ == '__main__':
    app.run(debug=True)
