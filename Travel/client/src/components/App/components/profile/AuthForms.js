import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useDispatch } from 'react-redux';
import {
  Typography, Grid, TextField, Button,
  Autocomplete, Chip
} from '@mui/material';
import { userLI, setToken, setError, setLoading } from '../../store/userSlice';
import { userLogin } from '../../store/loginSlice';
import { localpath } from '../../localpath';

// Component for login and registration forms
const AuthForms = ({ isRegister, setIsRegister, message, setMessage }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cookies, setCookie] = useCookies(["access_token"]);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [languagesSpoken, setLanguagesSpoken] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [errors, setErrors] = useState({});

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length > 0) {
      formatted += cleaned.substring(0, 3);
      if (cleaned.length > 3) {
        formatted += '-' + cleaned.substring(3, 6);
      }
      if (cleaned.length > 6) {
        formatted += '-' + cleaned.substring(6, 10);
      }
    }
    return formatted;
  };

  const clearFields = () => {
    setUsername('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setLanguagesSpoken([]);
    setErrors({});
  };

  useEffect(() => {
    clearFields();
  }, [isRegister]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.post(localpath + '/info/getLanguages');
        if (response.data && response.data.languages) {
          setAvailableLanguages(response.data.languages);
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };
    
    fetchLanguages();
  }, []);

  // Add new useEffect to check for existing authentication on component mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = cookies.access_token;
      const userID = window.localStorage.getItem("userID");
      
      if (token && userID) {
        dispatch(setLoading(true));
        try {
          // Set token in Redux store
          dispatch(setToken(token));
          
          // Initialize user state with ID
          dispatch(userLI([{
            id: userID,
          }]));
          
          // Get full user info
          const username = window.localStorage.getItem("username");
          if (username) {
            const updatedUserResponse = await axios.post(localpath + '/api/getUserInfo', {
              username: username
            });
            
            if (updatedUserResponse.data) {
              dispatch(userLI(updatedUserResponse.data));
            }
          }
          
          // Update login status
          dispatch(userLogin());
        } catch (error) {
          console.error('Error restoring session:', error);
          // Clear invalid credentials
          window.localStorage.removeItem("userID");
          window.localStorage.removeItem("username");
        } finally {
          dispatch(setLoading(false));
        }
      }
    };
    
    checkExistingAuth();
  }, [cookies.access_token, dispatch]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    let tempErrors = {};

    if (username.trim() === '') tempErrors.username = "Username is required";
    if (password.trim() === '') tempErrors.password = "Password is required";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      dispatch(setLoading(true));
      
      const response = await axios.post(localpath + "/auth/login", { 
        username, 
        password 
      });

      if (response.data && response.data.token) {
        // Store token in Redux
        dispatch(setToken(response.data.token));
        
        // Store token in cookie for persistence
        setCookie("access_token", response.data.token);
        
        // Save userID and username in localStorage for persistence
        window.localStorage.setItem("userID", response.data.userID);
        window.localStorage.setItem("username", username);
        
        // Store user info in Redux state
        dispatch(userLI([{
          id: response.data.userID,
          username: username,
        }]));

        // update with all user info
        const updatedUserResponse = await axios.post(localpath + '/api/getUserInfo', {
          username: username
        });
        console.log(updatedUserResponse.data)   
        if (updatedUserResponse.data) {
          dispatch(userLI(updatedUserResponse.data));
        }
        
        // Update login status
        dispatch(userLogin());
        
        // No need to navigate anywhere as we're already on the profile page
        // The Profile component will automatically show the user profile content
      } else {
        dispatch(setError("Login failed: No token received"));
        setMessage("Login failed. Please try again.");
      }
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "An error occurred"));
      setMessage(err.response?.data?.message || "An error occurred");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    let tempErrors = {};

    // Username validation
    if (!username || username.trim() === '') {
      tempErrors.username = "Username is required";
    } else if (username.length < 3) {
      tempErrors.username = "Username must be at least 3 characters";
    }

    // Password validation
    if (!password || password.trim() === '') {
      tempErrors.password = "Password is required";
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    // First Name validation
    if (!firstName || firstName.trim() === '') {
      tempErrors.firstName = "First Name is required";
    }

    // Last Name validation
    if (!lastName || lastName.trim() === '') {
      tempErrors.lastName = "Last Name is required";
    }

    // Email validation
    if (!email || email.trim() === '') {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    // Phone Number validation
    if (!phoneNumber) {
      tempErrors.phoneNumber = "Phone Number is required";
    } else if (phoneNumber.replace(/\D/g, '').length !== 10) {
      tempErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    // Languages validation
    if (!languagesSpoken || languagesSpoken.length === 0) {
      tempErrors.languagesSpoken = "At least one language is required";
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      const response = await axios.post(localpath + "/auth/register", {
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        languages_spoken: languagesSpoken.join(', ')
      });

      setMessage(response.data.message);

      if (response.data.message === "User registered successfully") {
        setIsRegister(false);
        clearFields();
      }
    } catch (err) {
      if (err.response?.data?.field) {
        // Handle field-specific errors from the server
        setErrors({
          ...errors,
          [err.response.data.field]: err.response.data.message
        });
      } else {
        setMessage(err.response?.data?.message || "An error occurred");
      }
    }
  };

  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
    setErrors({});
    setMessage('');
  };

  return (
    <>
      <Grid item xs={12} p={0}>
        <Typography variant="h4" textAlign="center" sx={{ fontWeight: 1000, fontSize: 50 }}>
          {isRegister ? "REGISTER" : "LOGIN"}
        </Typography>
        {message && (
          <Typography 
            variant="body1" 
            color={message.toLowerCase().includes("success") ? "success.main" : "error"}
            textAlign="center" 
            sx={{ mt: 2 }}
          >
            {message}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} p={1} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Grid item xs={4}>
          <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit}>
            <TextField
              label="Username"
              fullWidth
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors({ ...errors, username: '' });
              }}
              margin="normal"
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: '' });
              }}
              margin="normal"
              error={!!errors.password}
              helperText={errors.password}
            />
            {isRegister && (
              <>
                <TextField
                  label="First Name"
                  fullWidth
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setErrors({ ...errors, firstName: '' });
                  }}
                  margin="normal"
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
                <TextField
                  label="Last Name"
                  fullWidth
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setErrors({ ...errors, lastName: '' });
                  }}
                  margin="normal"
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: '' });
                  }}
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <TextField
                  label="Phone Number"
                  fullWidth
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(formatPhoneNumber(e.target.value));
                    setErrors({ ...errors, phoneNumber: '' });
                  }}
                  margin="normal"
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  inputProps={{
                    maxLength: 12,
                    placeholder: "XXX-XXX-XXXX"
                  }}
                />
                <Autocomplete
                  multiple
                  id="languages-spoken"
                  options={availableLanguages}
                  value={languagesSpoken}
                  onChange={(event, newValue) => {
                    setLanguagesSpoken(newValue);
                    setErrors({ ...errors, languagesSpoken: '' });
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip 
                        label={option} 
                        {...getTagProps({ index })} 
                        color="primary"
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Languages Spoken"
                      fullWidth
                      margin="normal"
                      error={!!errors.languagesSpoken}
                      helperText={errors.languagesSpoken}
                    />
                  )}
                />
              </>
            )}
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              {isRegister ? "REGISTER" : "LOG IN"}
            </Button>
          </form>
          <Button onClick={toggleAuthMode} sx={{ mt: 1 }} fullWidth>
            {isRegister
              ? "Already have an account? Log in"
              : "Don't have an account? Register"}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default AuthForms; 