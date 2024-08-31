from flask import request, jsonify, send_file, abort
from api.wikipedia_handler import extract_wiki_content
from api.audio_generator import generate_audio_file
from api.file_handler import get_safe_filename, save_text, save_audio, load_audio, load_text, list_audio_files
from api.gpt_handler import rewrite_content_with_gpt4

def init_routes(app):
    from urllib.parse import urlparse, unquote

    @app.route('/generate_audio', methods=['POST'])
    def generate_audio_from_wiki():
        data = request.json
        title = data.get('title')
        lang = data.get('lang', 'en')
        size = data.get('size', 0)
        force_regenerate = data.get('force_regenerate', False)
    
        # Check if the title is a Wikipedia URL
        if title.startswith('http'):
            parsed_url = urlparse(title)
            lang = parsed_url.netloc.split('.')[0]
            title = unquote(parsed_url.path.split('/')[-1].replace('_', ' '))
    
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
                return jsonify({"filename": f"{safe_filename}.wav"})
    
        existing_text = load_text(safe_filename)
        if existing_text and not force_regenerate:
            print("Using existing text content")
            content = existing_text
        else:
            content = extract_wiki_content(title, lang)
            if content.startswith("Error:"):
                return jsonify({"error": content}), 400
            save_text(content, safe_filename)
    
        rewritten_content = rewrite_content_with_gpt4(content)
        save_text(rewritten_content, f"{safe_filename}_rewritten")
    
        output_filename = generate_audio_file(rewritten_content, lang)
        print("Audio fusionné généré :", output_filename)
    
        save_audio(output_filename, safe_filename)

        return jsonify({"filename": f"{safe_filename}.wav"})

    @app.route('/list_audio_files', methods=['GET'])
    def list_audio_files_route():
        print("List audio files", list_audio_files())
        return jsonify(list_audio_files())

    @app.route('/download_audio', methods=['GET'])
    def download_audio():
        title = request.args.get('title')
        lang = request.args.get('lang', 'en')
        if not title:
            return jsonify({"error": "Missing title parameter"}), 400
        
        safe_filename = get_safe_filename(title, lang)
        audio_file = load_audio(safe_filename)
        print(audio_file)
        if audio_file:
            return send_file("../" + audio_file, mimetype='audio/wav', as_attachment=True, download_name=f'{safe_filename}.wav')
        else:
            abort(404, description="Audio file not found")

        @app.route('/add_comment', methods=['POST'])
        def add_comment():
            data = request.json
            audio_file = data.get('audioFile')
            comment = data.get('comment')
        
            if not audio_file or not comment:
                return jsonify({"error": "Missing audio file or comment"}), 400
        
            # In a real application, you would save this comment to a database
            # For now, we'll just return the comment as if it was saved
            new_comment = {"text": comment, "audioFile": audio_file}
        
            return jsonify(new_comment), 201
