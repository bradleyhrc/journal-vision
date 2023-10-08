import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  file_path: string;
  start_time: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ file_path, start_time }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.addEventListener('loadedmetadata', () => {
      if (videoRef.current) videoRef.current.currentTime = start_time;
    });

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', () => {
          if (videoRef.current) videoRef.current.currentTime = start_time;
        });
      }
    }
  }, [start_time]);

  return (
    <video ref={videoRef} controls autoPlay>
      <source src={`http://127.0.0.1:5000/api/stream_video?file_path=${file_path}`} type="video/mp4" />
      Your browser does not support video.
    </video>
  );
}

export default VideoPlayer;
