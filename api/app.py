import multiprocessing

# Set the start method to 'spawn'
multiprocessing.set_start_method('spawn', force=True)

from flask import Flask, request, Response, jsonify, send_file
import os
import pathlib
import tempfile
import io
import base64
import json
import numpy as np
from scipy.io.wavfile import write
import torch
from styletts2 import tts
from dotenv import load_dotenv
import openai

load_dotenv()

SAMPLE_RATE = 24000
tts_model = tts.StyleTTS2()

app = Flask(__name__)

CHAR_BUFFER_LEN = 100
end_of_sentence_punctuation = ['.', '!', '?']


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

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))



def textToSpeech(text):
    voicewave = tts_model.inference(text, diffusion_steps=3, output_sample_rate=SAMPLE_RATE)
    return voicewave

def ndarrayToBase64(arr):
    bytes_wav = bytes()
    byte_io = io.BytesIO(bytes_wav)
    write(byte_io, SAMPLE_RATE, arr)
    wav_bytes = byte_io.read()
    audio_data = base64.b64encode(wav_bytes).decode('UTF-8')
    return audio_data

def generateAudioSseEvent(text):
    if not text:
        return 'data: %s\n\n' % json.dumps({"text": ""})
    audio = ndarrayToBase64(textToSpeech(text))
    return 'data: %s\n\n' % json.dumps({"audio": audio})

@app.route('/')
def hello():
    html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <title>Realtime Text->Audio Generator</title>
    </head>
    <body>
    <input type="text" id="inputField" placeholder="Enter question here">
    <button onclick="sendMessage()">Send</button>
    <div id="result">      
    <script>
        var audioQueue = []
        var playing = false;
        const audioElement = new Audio();
        var currentIndex = 0;
        function playNextAudio() {
            if (currentIndex < audioQueue.length) {
              audioElement.src = audioQueue[currentIndex];
              audioElement.play();
              currentIndex++;

              audioElement.onended = function() {
                  playNextAudio();
              };

            } else {
              playing = false;
            }
        }

        function sendMessage() {
          var inputValue = document.getElementById('inputField').value;
          const queryString = '?question=' + encodeURIComponent(inputValue)
          var eventSource = new EventSource('/question' + queryString)
          eventSource.onmessage = function(event) {
            var message = JSON.parse(event.data);
            if (message.done) {
              console.log('Closing session')
              eventSource.close()
            }
            if (message.text) {
              document.getElementById("result").innerHTML += message.text;
            }
            if (message.audio) {
              audioQueue.push("data:audio/wav;base64," + message.audio)
              if (!playing) {
                playing = true;
                playNextAudio()
              }
            }
            console.log('Message: ' + message.text);
          };
        }
    </script>
    </body>
    </html>
    """
    return html

@app.route('/question')
def askQuestion():
    args = request.args
    question = args.get('question', 'How far is the moon from mars?')

    def stream():
        res = openai.ChatCompletion.create(
          model="gpt-3.5-turbo",
          messages=[{"role": "user", "content": question}],
          stream=True,
        )
        buff = ''
        for chunk in res:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                yield 'data: %s\n\n' % json.dumps({"text": content})
                buff += content
                # Try to keep sentences together, making the voice flow smooth
                last_delimiter_index = max(buff.rfind(p) for p in end_of_sentence_punctuation)
                if last_delimiter_index == -1 and len(buff) < CHAR_BUFFER_LEN:
                    continue
                current = buff[:last_delimiter_index + 1]
                buff = buff[last_delimiter_index + 1:]
                yield generateAudioSseEvent(current)
        yield generateAudioSseEvent(buff)
        yield 'data: %s\n\n' % json.dumps({"text": "", "audio": "", "done": True})
    return Response(stream(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
