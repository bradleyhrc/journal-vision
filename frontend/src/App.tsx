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
      function settime() {
        var video = document.getElementById("video1") as HTMLVideoElement | null;
        if (video) video.currentTime = data["Start_Time"];
      }
      settime();
    })
    .catch(error => console.error("Error getting match:", error));
  };

  if (!isAuthenticated) {
    return (
      <AppWrap>
        <Title>Journal Vision</Title>
        <Subtitle>Dive into your video records in seconds. ✨</Subtitle>
        <StyledButton onClick={() => loginWithRedirect()}>Log In</StyledButton>
      </AppWrap>
    );
  }

  return (
    <AppWrap>
      <Layout>
        <VideoSection>
          {video && (
            <VideoPlayer key={video} file_path={video} start_time={startTime} />
          )}
        </VideoSection>
        <AccountSection>
          <Text>
            Welcome {isAuthenticated && user ? user.name : ""}
          </Text>
          <SearchContainer>
            <StyledInput type="text" value={prompt} onChange={handlePromptChange} placeholder="Search..." />
            <StyledButton onClick={getMatch}>Prompt</StyledButton>
          </SearchContainer>
          <Upload>
            <input type="file" onChange={handleFileChange} accept='.mp4' style={{ color: "white" }} />
            <SmallButton onClick={handleUpload}>+</SmallButton>
          </Upload>
        </AccountSection>
      </Layout>
    </AppWrap>
  );
}

export default App;

const Upload = styled.div`
  padding-top: 16px;
  height: 24px;
  display: flex;
  justify-content: space-between;
  align-items: right;
  justify-content: right;
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  justify-content: center;
  
  gap: 16px;
  height: 42px;
`;

const AppWrap = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Layout = styled.div`
  display: flex;
  justify-content: space-between;
  height: 100vh;
  width: 100%;
`;

const VideoSection = styled.div`
  width: 65%;
  padding: 12px;
`;

const AccountSection = styled.div`
  width: 35%;
  display: flex;
  flex-direction: column;
  justify-content: top;
  padding: 12px;
`;

const Text = styled.p`
  font-size: 24px;
  color: #f9f9f9;
  margin-bottom: 16px;
`;

const StyledInput = styled.input`
  height: 20px;
  background-color: #343240;
  color: #f9f9f9;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  width: 80%;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 0px;

  &:focus {
    outline: none;
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08), 0 0 10px rgba(108, 95, 206, 0.8);
  }
`;

const Title = styled.h1`
  font-size: 72px;
  color: #f9f9f9;
  margin-top: 30vh;
  margin-bottom: 10px;
`;

const Subtitle = styled.h2`
  font-size: 36px;
  color: #f9f9f9;
`;

const StyledButton = styled.button`
  background-color: #6C5FCE; 
  color: #f9f9f9; 
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08), 0 0 0 rgba(108, 95, 206, 0.5);

  &:hover {
    background-color: #5B50AE; 
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 8px rgba(108, 95, 206, 0.72);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    background-color: #A9A9A9;
    cursor: not-allowed;
  }
`;

const SmallButton = styled.button`
  background-color: #6C5FCE; 
  color: #f9f9f9; 
  padding: 4px 18px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08), 0 0 0 rgba(108, 95, 206, 0.5);

  &:hover {
    background-color: #5B50AE; 
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 8px rgba(108, 95, 206, 0.72);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    background-color: #A9A9A9;
    cursor: not-allowed;
  }
`;
