import csv

def save_to_csv(video_data, file_name="videos_data.csv"):
  with open(file_name, 'a', newline='') as csvfile:
    writer = csv.writer(csvfile)

    if csvfile.tell() == 0:
      header = ["File_Path", "Segment_n", "Start_Time", "End_Time", "Transcript", "Audio_Conf", "Video_Labels"]
      writer.writerow(header)
    
    for segment in video_data:
      #segment[6] = ";".join([f"{label[0]}: {label[1]}" for label in segment[6]])
      writer.writerow(segment)
