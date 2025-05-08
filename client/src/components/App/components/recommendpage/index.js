import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment } from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import HomeIcon from '@mui/icons-material/Home';
import MobileStepper from '@mui/material/MobileStepper';
import Autocomplete from '@mui/material/Autocomplete';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';

import Navbar from '../navbar';
import DestinationCard from './destinationcard';

import { localpath } from '../../localpath';

// Redux imports
import { useSelector, useDispatch } from 'react-redux';
import { userLogin, userLogout } from '../../store/loginSlice';
import { userLI, userLO } from '../../store/userSlice';

const getDesignTokens = (mode) => ({
  typography: {
    fontFamily: 'Montserrat',
  },
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#E9DB5D' },
          text: { primary: '#000' },
        }
      : {
          primary: { main: '#b3cde0' },
          success: { main: '#9FE2BF' },
          text: { primary: '#b3cde0' },
        }),
  },
});

const WEIGHTS = {
  safety: 0.3,
  temperature: 0.3,
  industry: 0.4,
};

function Recommendations() {
  const [mode, setMode] = React.useState('dark');
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [selectedDepartures, setSelectedDepartures] = React.useState(null);
  const [travelDate, setDate] = React.useState(null);
  const [cities, setCities] = React.useState([]);
  const [travelDestinations, setTravelDestinations] = React.useState([]);
  const [preferredAirportCity, setPreferredAirportCity] = React.useState('');
  const [recomFlights, setRecomFlights] = React.useState([]);
  const [destinationsRecom, setDestinationsRecom] = React.useState([]);
  const [searchParamsRecom, setSearchParamsRecom] = React.useState({
    originCode: '',
    destinationCode: '',
    departureDate: new Date().toISOString().substring(0, 10),
    returnDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().substring(0, 10),
    currency: 'USD',
    adults: 1,
  });
  const [showDetails, setShowDetails] = React.useState({});

  // Redux
  const loginState = useSelector((state) => state.login.value);
  const userState = useSelector((state) => state.user.value);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    dispatch(userLO());
    dispatch(userLogout());
    navigate('/profile');
  };

  const [username, setusername] = React.useState('');
  const [password, setpassword] = React.useState('');

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const handleUserChange = (event) => {
    setusername(event.target.value);
  };

  const handlePassChange = (event) => {
    setpassword(event.target.value);
  };

  const handleChange = (newValue) => {
    if (newValue) {
      setSearchParamsRecom((prevParams) => ({
        ...prevParams,
        originCode: newValue.code,
      }));
    }
    setSelectedDepartures(newValue);
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(localpath + '/api/getTravelDestinations', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to fetch cities');
        const data = await res.json();
        setCities(data.map((dest) => ({ label: `${dest.city} (${dest.airport_codes.slice(2, 5)})`, code: dest.airport_codes.slice(2, 5) })));
        setTravelDestinations(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (!userState[0].username) {
      navigate('/profile');
    } else if (userState[0].preferred_airport && cities.length > 0) {
      const userAirport = cities.find((city) => city.code === userState[0].preferred_airport);
      if (userAirport) {
        setSelectedDepartures(userAirport);
        setPreferredAirportCity(userAirport.label.split(' (')[0]);
        setSearchParamsRecom((prevParams) => ({
          ...prevParams,
          originCode: userAirport.code,
        }));
      }
    }
  }, [userState, navigate, cities]);

  useEffect(() => {
    if (selectedDepartures && travelDate) {
      fetchRecommendations();
    }
  }, [selectedDepartures, travelDate]);

  useEffect(() => {
    const recomTest = async () => {
      if (!destinationsRecom || destinationsRecom.length === 0) {
        return;
      }
      setLoading(true);
      setRecomFlights([]);
      try {
        const requests = destinationsRecom.map((destinationCode) => {
          if (!destinationCode) {
            return Promise.resolve({ data: [null] });
          }
          const updatedParams = {
            ...searchParamsRecom,
            destinationCode,
          };
          return axios.post(localpath + '/search-flights-recommendations', updatedParams);
        });
        const responses = await Promise.all(requests);
        const newRecomFlights = responses.map((response) => (response.data && response.data.length > 0 ? response.data[0] : null));
        setRecomFlights(newRecomFlights);
      } catch (error) {
        console.error('Error fetching flights:', error);
      } finally {
        setLoading(false);
      }
    };
    if (destinationsRecom && destinationsRecom.length > 0) {
      recomTest();
    }
  }, [destinationsRecom]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileRes = await fetch(localpath + '/api/getUserInfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userState[0].username }),
      });
      const historyRes = await fetch(localpath + '/api/getUserFlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: userState[0].id }),
      });

      if (!profileRes.ok || !historyRes.ok) throw new Error('Failed to fetch user data');
      const profile = await profileRes.json();
      const travelHistoryRaw = await historyRes.json();

      const travelHistory = await Promise.all(
        travelHistoryRaw.map(async (flight) => {
          const dest = travelDestinations.find((d) => d.airport_codes.includes(flight.dep_code));
          return {
            safety_score: dest ? dest.safety_score : 0,
            avg_temperature: dest ? dest.current_temp : 0,
            is_urban: dest ? dest.isUrban : 0,
          };
        })
      );

      const destinations = travelDestinations;
      const recommendedDestinations = calculateRecommendations(profile[0], travelHistory, destinations);
      const top3 = recommendedDestinations.slice(0, 3);
      setRecommendations(top3);
      setDestinationsRecom(top3.map((rec) => rec.details.airport_codes));
    } catch (error) {
      setError(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRecommendations = (profile, travelHistory, destinations) => {
    const { temp: preferred_temp, safety_score: preferred_safety, urban: preferred_industry } = profile;
    const pastAverages = travelHistory.length > 0
      ? travelHistory.reduce(
          (acc, trip) => ({
            safety: acc.safety + trip.safety_score / travelHistory.length,
            temperature: acc.temperature + trip.avg_temperature / travelHistory.length,
            industry: acc.industry + (trip.is_urban ? 1 : 0) / travelHistory.length,
          }),
          { safety: 0, temperature: 0, industry: 0 }
        )
      : { safety: preferred_safety, temperature: preferred_temp, industry: preferred_industry };

    const month = travelDate ? travelDate.$M : new Date().getMonth();
    const scoredDestinations = destinations.map((dest) => {
      const month_temp = dest.avg_monthly_temps
        ? Number(dest.avg_monthly_temps.slice(1, dest.avg_monthly_temps.length).split(',')[month])
        : dest.current_temp || 20; // Fallback to current_temp or default
      const safetyTarget = preferred_safety * 0.5 + pastAverages.safety * 0.5;
      const tempTarget = preferred_temp * 0.5 + pastAverages.temperature * 0.5;
      const industryTarget = preferred_industry * 0.5 + pastAverages.industry * 0.5;

      const safetyScore = dest.safety_score >= safetyTarget ? 1 : dest.safety_score / safetyTarget;
      const tempScore = 1 - Math.abs(month_temp - tempTarget) / 10;
      const industryScore = 1 - Math.abs(Number(dest.isUrban) - industryTarget);

      const totalScore = safetyScore * WEIGHTS.safety + tempScore * WEIGHTS.temperature + industryScore * WEIGHTS.industry;

      return {
        destination: dest.city,
        score: totalScore,
        details: {
          safety_score: dest.safety_score,
          avg_temperature: month_temp,
          is_urban: dest.isUrban,
          description: dest.description,
          airport_codes: dest.airport_codes.slice(2, 5),
        },
      };
    });

    return scoredDestinations.sort((a, b) => b.score - a.score);
  };

  const toggleDetails = (index) => {
    setShowDetails((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Grid container spacing={2} p={4}>
        <Grid item xs={12} p={0}>
          <Typography variant="h4" textAlign={'center'} sx={{ fontWeight: 1000, fontSize: 50 }}>
            RECOMMENDATIONS
          </Typography>
        </Grid>

        {userState[0].preferred_airport && (
          <Grid item xs={12}>
            <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Preferred Departure Airport:</Typography>
            <Typography>
              {userState[0].preferred_airport} {preferredAirportCity ? `(${preferredAirportCity})` : ''}
            </Typography>
          </Grid>
        )}

        <Grid item xs={2} container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              options={cities}
              getOptionLabel={(option) => option.label}
              value={selectedDepartures}
              onChange={(event, newValue) => handleChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Departure Location"
                  placeholder="Select your departure airport"
                  helperText={!selectedDepartures ? 'Select your departure location to begin' : ''}
                  sx={{
                    width: '100%',
                    input: { color: '#b3cde0' },
                    '& .MuiInputLabel-root': { color: '#b3cde0' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#b3cde0' },
                      '&:hover fieldset': { borderColor: '#ececec' },
                      '&.Mui-focused fieldset': { borderColor: '#F95D44' },
                    },
                    '& .MuiSvgIcon-root': { color: '#b3cde0' },
                  }}
                />
              )}
            />
            <Grid paddingTop={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Departure Date"
                  slotProps={{
                    textField: {
                      id: 'departureDate',
                      helperText: selectedDepartures && !travelDate ? 'Select a date to see recommendations' : !selectedDepartures ? 'First select a departure location above' : 'Recommendations will update automatically',
                      sx: {
                        width: '100%',
                        input: { color: '#b3cde0' },
                        '& .MuiInputLabel-root': { color: '#b3cde0' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#b3cde0' },
                          '&:hover fieldset': { borderColor: '#ececec' },
                          '&.Mui-focused fieldset': { borderColor: '#F95D44' },
                        },
                        '& .MuiSvgIcon-root': { color: '#b3cde0' },
                      },
                    },
                  }}
                  onChange={(newValue) => {
                    setDate(newValue);
                    if (newValue) {
                      setSearchParamsRecom((prevParams) => ({
                        ...prevParams,
                        departureDate: newValue.toISOString().substring(0, 10),
                        returnDate: new Date(newValue.$d.setDate(newValue.$d.getDate() + 7)).toISOString().substring(0, 10),
                      }));
                    }
                  }}
                  disabled={!selectedDepartures}
                  disablePast
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={10}>
          {loading && <Typography>Loading your personalized recommendations...</Typography>}
          {error && <Typography color="error">Error: {error}</Typography>}
          {!loading && !error && recommendations.length > 0 && (
            <Grid container spacing={2}>
              {recommendations.map((rec, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <DestinationCard
                    destination={rec}
                    showDetails={showDetails[index]}
                    onToggleDetails={() => toggleDetails(index)}
                    departureCode={selectedDepartures?.code}
                    departureDate={travelDate?.toISOString().substring(0, 10)}
                    flightPrice={recomFlights && recomFlights[index] && recomFlights[index].price ? recomFlights[index].price.total : null}
                  />
                </Grid>
              ))}
            </Grid>
          )}
          {!loading && !error && recommendations.length === 0 && (
            <Typography>
              {selectedDepartures && travelDate ? 'No recommendations available for your criteria.' : 'Select your departure location and travel date to see personalized recommendations.'}
            </Typography>
          )}
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default Recommendations; 