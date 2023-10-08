import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
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
    </AppWrap>
  );
}

export default App;

const AppWrap = styled.div`
  text-align: center;
`;