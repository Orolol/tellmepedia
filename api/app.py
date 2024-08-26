from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/generate_audio', methods=['POST'])
def generate_audio():
    data = request.json
    wiki_url = data.get('wiki_url')
    
    # Ici, nous ajouterons plus tard la logique pour traiter l'URL Wikipedia,
    # générer l'audio, etc.
    
    # Pour l'instant, nous retournons juste un message de confirmation
    return jsonify({"message": f"Audio generation requested for URL: {wiki_url}"}), 200

if __name__ == '__main__':
    app.run(debug=True)
