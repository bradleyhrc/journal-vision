from moviepy.editor import VideoFileClip
from google.cloud import speech
from google.cloud import videointelligence
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "journal-vision.json"

# audio
client = speech.SpeechClient()
# visual
vid_client = videointelligence.VideoIntelligenceServiceClient()
features = [videointelligence.Feature.LABEL_DETECTION]

def analyze_fragment(fragment):
  """
  Placeholder function to analyze a video fragment.
  Audio and visual analysis.
  
  :param fragment: A video fragment (subclip).
  """
  audio = fragment.audio
  audio_file_path = "temp_audio.flac"
  audio.write_audiofile(audio_file_path, codec="flac")

  with open(audio_file_path, "rb") as audio_file:
    content = audio_file.read()
  audio = speech.RecognitionAudio(content=content)
  config = speech.RecognitionConfig(
    encoding=speech.RecognitionConfig.AudioEncoding.FLAC,
    sample_rate_hertz=44100,
    language_code="en-US",
    audio_channel_count=2
  )
  response = client.recognize(config=config, audio=audio)
  
  transcript = ",".join([result.alternatives[0].transcript for result in response.results])
  confidence = [result.alternatives[0].confidence for result in response.results]
  avg_confidence = sum(confidence) / len(confidence)
  os.remove(audio_file_path)

  # visual
  video_temp_path = "temp_video.mp4"
  fragment.write_videofile(video_temp_path, codec="libx264", audio_codec="aac")

  with open(video_temp_path, "rb") as file:
    input_content = file.read()
  
  operation = vid_client.annotate_video(
    request={"features": features, "input_content": input_content}
  )
  print("Processing video for label detection...")
  result = operation.result(timeout=30)

  os.remove(video_temp_path)

  segment_labels = result.annotation_results[0].segment_label_annotations
  labels = [label.entity.description for label in segment_labels]

  print(segment_labels)

  return {
    "transcript": transcript,
    "conf": round(avg_confidence, 2),
    "video_labels": ", ".join(labels)
  }

def process_video_for_analysis(input_path, segment_duration=20):
  """
  Splits a video into segments of given duration and analyzes each fragment.
  
  :param input_path: Path to the input video.
  :param segment_duration: Duration of each segment in seconds (default: 40 seconds).
  """
  with VideoFileClip(input_path) as clip:
    video_duration = clip.duration

    if video_duration <= segment_duration:
      print(f"Processing fragment 1: 0 - {clip.duration} seconds")
      print(analyze_fragment(clip))
      return

    segment_count = int(video_duration // segment_duration);

    remainder = video_duration % segment_duration
    if 0 < remainder < segment_duration:
      segment_count -= 1

    for i in range(segment_count):
      start_time = i * segment_duration
      end_time = video_duration

      if i != segment_count -1:
        end_time = (i + 1) * segment_duration
      
      print(f"Processing fragment {i + 1}/{segment_count}: {start_time} - {end_time} seconds")
      fragment = clip.subclip(start_time, end_time)
      print(analyze_fragment(fragment))
