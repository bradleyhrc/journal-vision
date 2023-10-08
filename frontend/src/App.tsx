import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAuth0 } from '@auth0/auth0-react';

import VideoPlayer from './VideoPlayer';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [video, setVideo] = useState(null);
  const [startTime, setStartTime] = useState(0);

  const handlePromptChange = (event: any) => {
    setPrompt(event.target.value);
  };

  const { isLoading, user, isAuthenticated, loginWithRedirect } = useAuth0();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/")
      .then(response => response.text())
      .then(data => console.log(data))
      .catch(error => console.error("Error connecting to server:", error));
  }, []);

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('video', selectedFile);

    fetch("http://127.0.0.1:5000/upload", {
        method: 'POST',
        body: formData,
    })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error("Error uploading file:", error));
  };

  const getMatch = () => {
    fetch(`http://127.0.0.1:5000/api/match?prompt=${prompt}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setVideo(data["File_Path"]);
      setStartTime(data["Start_Time"]);
    })
    .catch(error => console.error("Error getting match:", error));
  };

  return (
    <AppWrap>
      Welcome {isAuthenticated && user ? user.name : "you"}
      {
      !isAuthenticated ? 
      (<button onClick={() => loginWithRedirect()}>Log In</button>) :
      <></>
      }
      <br />
      <input type="file" onChange={handleFileChange} accept=".mp4, .mov" />
      <button onClick={handleUpload}>Upload Video</button>
      <input type="text" value={prompt} onChange={handlePromptChange} placeholder="Enter your prompt"/>
      <button onClick={getMatch}>Prompt</button>
      {video && (
        <VideoPlayer file_path={video} start_time={startTime} />
      )}
    </AppWrap>
  );
}

export default App;

const AppWrap = styled.div`
  text-align: center;
`;