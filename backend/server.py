from flask import Flask, request, jsonify, send_from_directory, Response, stream_with_context
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
from processor import process_video_for_analysis

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from functools import partial

import pandas as pd

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp4', 'mov'}

if not os.path.exists(UPLOAD_FOLDER):
  os.makedirs(UPLOAD_FOLDER)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
  return "Journal Vision Backend Server"

def allowed_file(filename):
  return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
  if 'video' not in request.files:
    return jsonify(error="No video part in the request"), 400
  file = request.files['video']
  if file.filename == '':
    return jsonify(error="No video selected"), 400
  if file and allowed_file(file.filename):
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    # Proceed with analysis
    process_video_for_analysis(filepath)
    return jsonify(success=True, filepath=filepath)
  else:
    return jsonify(success=False, message="File type not allowed"), 400

@app.route('/api/match', methods=['GET'])
def find_match():
  prompt = request.args.get('prompt', '')

  if not prompt:
    return jsonify(error="No prompt provided"), 400

  df = pd.read_csv("videos_data.csv")

  df["combined"] = df["Transcript"] + " " + df["Video_Labels"]

  vectorizer = TfidfVectorizer()
  tfidf_matrix = vectorizer.fit_transform(df["combined"])

  prompt_vector = vectorizer.transform([prompt])
  print(prompt_vector)
  cosine_similarities = cosine_similarity(prompt_vector, tfidf_matrix).flatten()
  closest_index = cosine_similarities.argmax()
  print(cosine_similarities)

  closest_data = df.iloc[closest_index].to_dict()
  return jsonify(closest_data)

@app.route('/api/stream_video', methods=['GET'])
def stream_video():
  file_path = request.args.get('file_path')
  if not file_path:
    return jsonify(error="No file path provided"), 400

  range_header = request.headers.get('Range', None)
  video_size = os.path.getsize(file_path)

  if not range_header:
    response = Response(
      open(file_path, 'rb').read(),
      content_type='video/mp4',
      direct_passthrough=True
    )
    response.headers.add('Content-Length', str(video_size))
    return response

  start, end = range_header.split('=')[1].split('-')
  start = int(start)
  end = int(end) if end else video_size - 1
  length = end - start + 1

  response = Response(
    read_file(file_path, start, length),
    status=206,
    content_type='video/mp4',
    direct_passthrough=True
  )
  response.headers.add('Content-Range', 'bytes {0}-{1}/{2}'.format(start, end, video_size))
  response.headers.add('Accept-Ranges', 'bytes')
  response.headers.add('Content-Length', str(length))

  return response;

def read_file(file, offset, length):
  with open(file, 'rb') as f:
    f.seek(offset)
    chunk = f.read(length)
    yield chunk

if __name__ == '__main__':
  app.run(debug=True)
