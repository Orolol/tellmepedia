import pathlib

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

def list_audio_files():
    audio_files = []
    audio_dir = pathlib.Path("saved_audio")
    for file in audio_dir.glob("*.wav"):
        filename = file.stem
        parts = filename.rsplit('_', 1)
        title = '_'.join(parts[:-1])
        lang = parts[-1]
        audio_files.append({"title": title, "lang": lang})
    return audio_files
