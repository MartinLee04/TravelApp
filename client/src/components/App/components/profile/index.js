import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useSelector, useDispatch } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Import components
import Navbar from '../navbar';
import UserProfileContent from './UserProfileContent';
import AuthForms from './AuthForms';
import { getDesignTokens } from './theme';

// Import Redux actions
import { userLogin, userLogout } from '../../store/loginSlice';
import { userLI, userLO } from '../../store/userSlice';

// Import API path
import { localpath } from '../../localpath';

function Profile() {
  const [mode] = useState('dark');
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const [message, setMessage] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const dispatch = useDispatch();

  // Get user state from Redux
  const userState = useSelector(state => state.user.value);
  const isLoggedIn = useSelector(state => state.login.value);

  const handleLogout = () => {
    dispatch(userLO());
    dispatch(userLogout());
    removeCookie("access_token");
    window.localStorage.removeItem("userID");
  };
  
  // Check for token on component mount
  useEffect(() => {
    if (cookies.access_token && !isLoggedIn) {
      try {
        const decodedToken = jwtDecode(cookies.access_token);
        
        // Check if token is valid and not expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp > currentTime) {
          // Valid token but not logged in - restore user session
          fetchUserData(decodedToken.id);
        } else {
          // Token expired - clear it
          removeCookie("access_token");
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        removeCookie("access_token");
      }
    }
  }, []);
  
  const fetchUserData = async (userId) => {
    console.log(userId)
    try {
      const response = await axios.post(localpath + '/api/getUserInfoById', {
        id: userId
      });
      
      if (response.data && response.data.length > 0) {
        console.log(response.data)
        dispatch(userLI(response.data));
        dispatch(userLogin());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Box p={4}>
        {isLoggedIn && userState && userState[0] && userState[0].id ? (
          <UserProfileContent 
            userInfo={userState[0]} 
            handleLogout={handleLogout} 
          />
        ) : (
          <AuthForms
            isRegister={isRegister}
            setIsRegister={setIsRegister}
            message={message}
            setMessage={setMessage}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default Profile;
