import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  file_path: string;
  start_time: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ file_path, start_time }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {

    const handleMetadataLoaded = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = start_time;
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', handleMetadataLoaded);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', handleMetadataLoaded);
      }
    };
  }, [start_time]);

  const videoURL = `http://127.0.0.1:5000/api/stream_video?file_path=${file_path}&timestamp=${Date.now()}`;

  return (
    <video id="video1" ref={videoRef} controls autoPlay>
      <source src={videoURL} type="video/mp4" />
      Your browser does not support video.
    </video>
  );
};

export default VideoPlayer;
