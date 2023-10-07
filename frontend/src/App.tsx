import React from 'react';
import styled from 'styled-components';

import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { isLoading, user, isAuthenticated, loginWithRedirect } = useAuth0();
  if (isLoading) return <></>;

  return (
    <AppWrap>
      Welcome {isAuthenticated && user ? user.name : "you"}
      {
      !isAuthenticated ? 
      (<button onClick={() => loginWithRedirect()}>Log In</button>) :
      <></>
      }
    </AppWrap>
  );
}

export default App;

const AppWrap = styled.div`
  text-align: center;
`;