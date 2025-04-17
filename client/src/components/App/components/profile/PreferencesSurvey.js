import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Typography, Box, Button, Slider, Autocomplete, TextField, Paper } from '@mui/material';
import { userLI } from '../../store/userSlice';
import { localpath } from '../../localpath';

// Component for user preferences form
const PreferencesSurvey = () => {
  const dispatch = useDispatch();
  
  // Fix the selector to match your Redux store structure
  const userInfoArray = useSelector((state) => state.user.value);
  const userInfo = userInfoArray && userInfoArray.length > 0 ? userInfoArray[0] : {};
  
  console.log("UserInfo from Redux:", userInfo);
  
  // Initialize with default values
  const [preferences, setPreferences] = useState({
    safety_score: 5,
    temperature: 20,
    is_urban: 0.5,
    hotel_price: 1000,
    preferred_airport: null,
  });
  const [message, setMessage] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState(null);

  // Fetch cities and airport codes
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(localpath+'/api/getTravelDestinations', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to fetch cities');
        const data = await res.json();
        setCities(data.map(dest => ({ label: `${dest.city} (${dest.airport_codes.slice(2,5)})`, code: dest.airport_codes.slice(2,5) })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchCities();
  }, []);

  // Update preferences when userInfo changes
  useEffect(() => {
    if (userInfo && Object.keys(userInfo).length > 0) {
      setPreferences({
        safety_score: userInfo.safety_score || 5,
        temperature: userInfo.temp || 20,
        is_urban: userInfo.urban || 0.5,
        hotel_price: userInfo.hotel_price || 1000,
        preferred_airport: userInfo.preferred_airport || "",
      });
      
      // Find and set the selected airport if it exists
      if (userInfo.preferred_airport && cities.length > 0) {
        const foundAirport = cities.find(city => city.code === userInfo.preferred_airport);
        setSelectedAirport(foundAirport || null);
      }
    }
  }, [userInfo, cities]);

  const handleChange = (name) => (event, value) => {
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const handleAirportChange = (event, newValue) => {
    setSelectedAirport(newValue);
    if (newValue) {
      setPreferences(prev => ({ ...prev, preferred_airport: newValue.code }));
    } else {
      setPreferences(prev => ({ ...prev, preferred_airport: "" }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!userInfo || !userInfo.id) {
        setMessage('Error: User information not available');
        return;
      }

      const response = await axios.post(localpath + '/api/updatePreferences', {
        ss: preferences.safety_score,
        temp: preferences.temperature,
        urban: preferences.is_urban,
        hp: preferences.hotel_price,
        preferred_airport: preferences.preferred_airport,
        account_id: userInfo.id
      });

      if (response.data) {
        setMessage('Preferences updated successfully!');
        
        // Update user info in Redux
        const updatedUserResponse = await axios.post(localpath + '/api/getUserInfo', {
          username: userInfo.username
        });
        console.log(updatedUserResponse.data);
        if (updatedUserResponse.data) {
          dispatch(userLI(updatedUserResponse.data));
        }
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage('Failed to update preferences.');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Travel Preferences</Typography>
      
      {message && (
        <Typography 
          color={message.includes('success') ? 'success.main' : 'error'}
          sx={{ mb: 2 }}
        >
          {message}
        </Typography>
      )}
      
      <Typography sx={{ mt: 3, mb: 1 }}>
        Preferred Home Airport
      </Typography>
      <Autocomplete
        value={selectedAirport}
        onChange={handleAirportChange}
        options={cities}
        getOptionLabel={(option) => option.label || ""}
        renderInput={(params) => (
          <TextField 
            {...params} 
            label="Select your home airport" 
            fullWidth 
            sx={{ mb: 3 }}
          />
        )}
      />
      
      <Typography>
        Safety Score (Current: {preferences.safety_score}/10)
      </Typography>
      <Slider
        value={preferences.safety_score}
        onChange={handleChange('safety_score')}
        min={0}
        max={10}
        valueLabelDisplay="auto"
        sx={{ mb: 3 }}
      />
      
      <Typography>
        Temperature Preference (Current: {preferences.temperature}°C)
      </Typography>
      <Slider
        value={preferences.temperature}
        onChange={handleChange('temperature')}
        min={-20}
        max={40}
        valueLabelDisplay="auto"
        sx={{ mb: 3 }}
      />
      
      <Typography>
        Urban Preference (Current: {(preferences.is_urban * 100).toFixed(0)}% Urban)
      </Typography>
      <Slider
        value={preferences.is_urban}
        onChange={handleChange('is_urban')}
        min={0}
        max={1}
        step={0.1}
        valueLabelDisplay="auto"
        sx={{ mb: 3 }}
      />
      
      <Typography>
        Hotel Budget (Current: ${preferences.hotel_price})
      </Typography>
      <Slider
        value={preferences.hotel_price}
        onChange={handleChange('hotel_price')}
        min={100}
        max={5000}
        step={100}
        valueLabelDisplay="auto"
        sx={{ mb: 3 }}
      />
      
      <Button 
        variant="contained" 
        onClick={handleSubmit}
      >
        Save Preferences
      </Button>
      
      <Box mt={2} sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
        UserID: {userInfo.id ? userInfo.id : 'Not available'}
      </Box>
    </Box>
  );
};

export default PreferencesSurvey; 