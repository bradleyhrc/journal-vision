from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
from processor import process_video_for_analysis

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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

  prompt = "torture"

  df = pd.read_csv("videos_data.csv")

  df["combined"] = df["Transcript"] + " " + df["Video_Labels"]

  vectorizer = TfidfVectorizer()
  tfidf_matrix = vectorizer.fit_transform(df["combined"])

  prompt_vector = vectorizer.transform([prompt])
  cosine_similarities = cosine_similarity(prompt_vector, tfidf_matrix).flatten()
  closest_index = cosine_similarities.argmax()

  closest_data = df.iloc[closest_index].to_dict()
  return jsonify(closest_data)

if __name__ == '__main__':
  app.run(debug=True)
