from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp4', 'mov'}

app = Flask(__name__)
CORS(app)
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
    return jsonify(success=True, filepath=filepath)
  else:
    return jsonify(error="File type not allowed"), 400

if __name__ == '__main__':
  app.run(debug=True)
