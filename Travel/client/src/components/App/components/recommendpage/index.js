import React, {useEffect, useState} from 'react';
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Divider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment } from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import HomeIcon from '@mui/icons-material/Home';
import MobileStepper from '@mui/material/MobileStepper';
import Navbar from '../navbar';
import Autocomplete from '@mui/material/Autocomplete';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import DestinationCard from './destinationcard';

import {localpath} from '../../localpath'


//redux import
import { useSelector, useDispatch } from 'react-redux'
import { userLogin, userLogout  } from '../../store/loginSlice'
import { userLI, userLO  } from '../../store/userSlice'

const getDesignTokens = (mode) => ({
  typography: {
    fontFamily: 'Montserrat',
  },
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // 👇 palette values for light mode
          primary: {main: "#E9DB5D"},
          text: {
            primary: "#000",
          },
        }
      : 
      {
        // 👇 palette values for dark mode
        primary: { main: "#b3cde0"},
        success: { main: "#9FE2BF"},
        text: {
          primary: '#b3cde0',
        },
        backgroundImage: {

        }
      }),
  },
});



//Started writing code here
//WEIGTS is the weighting of how different layers of filter will be weighed for suggestion
const WEIGHTS = {
  safety: 0.25,
  temperature: 0.25,
  industry: 0.25,
  hotel: 0.25,
};

function Recommendations() {
    const [mode, setMode] = React.useState('dark');
    const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
    const navigate = useNavigate();


    const [recommendations, setRecommendations] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [departureLocations, setDepartureLocations] = useState([]);
    const [selectedDepartures, setSelectedDepartures] = useState([]);
    const [departureDate, setDepartureDate] = useState(null);
    const [cities, setCities] = useState([]);

    //redux
    const loginState = useSelector(state => state.login.value)
    const userState = useSelector(state => state.user.value)
    const dispatch = useDispatch()
  
    const handleLogout= async (e) => {
      dispatch(userLO())
      dispatch(userLogout());
      navigate("/profile");
    };

    const [username, setusername] = React.useState('');
    const [password, setpassword] = React.useState('');
    const [travelDate, setDate] = React.useState('');
    const [travelDest, setTravelDest] = React.useState([]);
    const [showDet, setDet] = React.useState([false,false,false]);

    const [searchParamsRecom, setSearchParamsRecom] = React.useState({
      // Dates in 'YYYY-MM-DD' format
      originCode: 'YYZ',
      destinationCode: '',
      departureDate: '2025-04-09',
      returnDate: '2025-04-15',
      currency: 'USD',
      adults: 1
    });

    const [destinationsRecom, setDestinationsRecom] = React.useState(['YUL','BCN','LIM','JFK','ATL','CDG','IST'])
    const [recomFlights, setRecomFlights] = React.useState([])

    // Add state to track which cards have details shown
    const [showDetails, setShowDetails] = useState({});

    // Add state for city name lookup of preferred airport
    const [preferredAirportCity, setPreferredAirportCity] = useState('');

    const toggleMode = (step) => {
        setMode(
        mode === 'light' ? 'dark' : 'light'
        );
    };

    const handleUserChange = (event) => {
        setusername(event.target.value)
    }

    const handlePassChange = (event) => {
        setpassword(event.target.value)
    }

    //Actual recommendation feature starts here
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
          setTravelDest(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchCities();
    }, []);

    useEffect(() => {
      if (userState[0].username) {
        // If user has a preferred airport set, use it as default
        if (userState[0].preferred_airport && cities.length > 0) {
          const userAirport = cities.find(city => city.code === userState[0].preferred_airport);
          if (userAirport) {
            setSelectedDepartures(userAirport);
            setPreferredAirportCity(userAirport.label.split(' (')[0]); // Extract city name
            setSearchParamsRecom((prevParams) => ({
              ...prevParams,
              originCode: userAirport.code,
            }));
          }
        }
      } else {
        navigate("/profile"); // Redirect to login if not authenticated
      }
    }, [userState, navigate, cities]);

    useEffect(() => {
      if (selectedDepartures && travelDate) {
        fetchRecommendations();
      }
    }, [selectedDepartures, travelDate]);

    const fetchRecommendations = async () => {
      if(selectedDepartures && travelDate){
        setLoading(true);
        setError(null);
        try {
          // Get current month (0-11 where 0 is January)
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          
          const profile = {
            preferred_safety: userState[0].safety_score,
            preferred_temp: userState[0].temp,
            preferred_industry: userState[0].urban,
            preferred_price: userState[0].hotel_price,
          };

          setSearchParamsRecom((prevParams) => ({
            ...prevParams,
            originCode: selectedDepartures.code,
            departureDate: travelDate.toISOString().substring(0, 3),
          }));

          // Use the same month for calculations as the date picker (or current month if no date)
          const month = travelDate ? travelDate.$M : currentMonth;
          
          //Calculating recommendations
          console.log("Using month for calculations:", month);
          const recommendedDestinations = calculateRecommendations(profile, travelDest, month);
          const top3 = recommendedDestinations.slice(0, 3); // Changed from top10 to top3
          setRecommendations(top3);
          
          // Extract airport codes for all 3 recommendations
          const codes = top3.map(rec => rec.details.airport_codes);
          console.log("Top 3 airport codes:", codes); // Updated log message
          setDestinationsRecom(codes);
        } catch (error) {
          setError(error.message);
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    const handleChange = (newValue) =>{
      console.log(newValue)
      if(newValue){
        setSearchParamsRecom((prevParams) => ({
        ...prevParams,
        originCode: newValue.code, 
        }))
        console.log(searchParamsRecom)
      }
      setSelectedDepartures(newValue)
    }

    const handleGetDetails = (index) => {
      if (recomFlights){
        setDet(prevArray => {
        const updatedArray = [...prevArray]; // Create a copy of the array
        updatedArray[index] = !prevArray[index]; // Modify the value at the specified index
        return updatedArray; // Return the updated array
        });
      }
      else{
        console.log(recomFlights)
        //recomTest()
      }
      
      // 
    }

    useEffect(() => {
      console.log("running flights");
      const recomTest = async () => {
        // Only proceed if we have destinations to search for
        if (!destinationsRecom || destinationsRecom.length === 0) {
          return; // Exit early if no destinations
        }
        
        setLoading(true);
        setRecomFlights([]);

        console.log(searchParamsRecom);

        try {
          const requests = destinationsRecom.map(destinationCode => {
            // Skip undefined or empty destination codes
            if (!destinationCode) {
              return Promise.resolve({ data: [null] });
            }
            
            const updatedParams = {
              ...searchParamsRecom,
              destinationCode,
            };
            return axios.post(
              localpath+'/search-flights-recommendations',
              updatedParams
            );
          });

          const responses = await Promise.all(requests);

          const newRecomFlights = responses.map(response => 
            response.data && response.data.length > 0 ? response.data[0] : null
          );
          setRecomFlights(newRecomFlights);

          responses.forEach((response, index) => {
            console.log('Response for destination:', destinationsRecom[index], response.data);
          });
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

    const calculateRecommendations = (profile, destinations, month) => {
      const { preferred_temp, preferred_safety, preferred_industry, preferred_price } = profile;
      
      console.log("Calculating with month:", month);
      
      // Score each destination
      const scoredDestinations = destinations.map((dest) => {
        // Ensure we're using the correct month from the array
        const month_temp = Number(dest.avg_monthly_temps.slice(1, dest.avg_monthly_temps.length).split(",")[month]);
        const month_hotel = Number(dest.hotel_prices.slice(1, dest.hotel_prices.length).split(",")[month]);
        
        console.log(`${dest.city} - Month ${month}: Temp ${month_temp}°C, Hotel $${month_hotel}`);
        
        // Blend preferred and past averages (50% each)
        const safetyTarget = preferred_safety;
        const tempTarget = preferred_temp;
        const industryTarget = preferred_industry;
        const priceTarget = preferred_price;

        const safetyScore = dest.safety_score >= safetyTarget 
          ? 1 
          : dest.safety_score / safetyTarget;
          
        const tempScore = 1 - Math.abs((month_temp) - tempTarget) / 10;
        
        const industryScore = 1 - Math.abs(Number(dest.isUrban) - industryTarget);
         
        const hotelScore = priceTarget - 50 <= month_hotel && month_hotel <= priceTarget 
          ? 1 
          : month_hotel <= priceTarget - 50 
            ? (month_hotel/priceTarget) 
            : 2-(month_hotel/priceTarget);

        const totalScore =
          safetyScore * WEIGHTS.safety +
          tempScore * WEIGHTS.temperature +
          industryScore * WEIGHTS.industry +
          hotelScore * WEIGHTS.hotel;

        return {
          destination: dest.city,
          score: totalScore,
          details: {
            safety_score: dest.safety_score,
            avg_temperature: month_temp,
            is_urban: dest.isUrban,
            description: dest.description,
            airport_codes: dest.airport_codes.slice(2,5),
            avg_hotel_price: month_hotel
          },
        };
      });
      
      // Sort by score (highest first)
      return scoredDestinations.sort((a, b) => b.score - a.score);
    };

    const toggleDetails = (index) => {
      setShowDetails(prev => ({
        ...prev,
        [index]: !prev[index]
      }));
    };

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar/>
        <Grid container spacing={2} p={4}>
          <Grid item xs={12} p={0}>
            <Typography variant="h4" textAlign={'center'} sx={{ fontWeight: 1000, fontSize: 50 }}>
              RECOMMENDATIONS
            </Typography>
          </Grid>
          
          {/* Show preferred airport if it exists */}
          {userState[0].preferred_airport && (
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                Preferred Departure Airport: 
              </Typography>
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
                onChange={(event, newValue) => setSelectedDepartures(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Departure Location" 
                    placeholder="Select your departure airport" 
                    helperText={!selectedDepartures ? "Select your departure location to begin" : ""}
                    sx = {{width: "100%", input: {
                      color: "#b3cde0",
                    },
                    "& .MuiInputLabel-root": {
                        color: "#b3cde0",
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#b3cde0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#ececec',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#F95D44',
                      },
                    },
                    "& .MuiSvgIcon-root": {
                        color: "#b3cde0",
                    },}}
                  />
                )}
              />
              <Grid paddingTop={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Departure Date"
                    slotProps={{
                      textField: {
                        id: "departureDate",
                        helperText: selectedDepartures && !travelDate 
                          ? "Select a date to see recommendations" 
                          : !selectedDepartures 
                            ? "First select a departure location above" 
                            : "Recommendations will update automatically",
                        sx: { width: "100%",
                          input: {
                            color: "#b3cde0",
                          },
                          "& .MuiInputLabel-root": {
                            color: "#b3cde0",
                          },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#b3cde0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#ececec',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#F95D44',
                            },
                          },
                          "& .MuiSvgIcon-root": {
                            color: "#b3cde0",
                          },
                        }
                      }
                    }}
                    onChange={(newValue) =>{
                      setDate(newValue);
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
                      departureCode={selectedDepartures.code}
                      departureDate={travelDate?.toISOString().substring(0, 10)}
                      flightPrice={recomFlights && recomFlights[index] && recomFlights[index].price ? recomFlights[index].price.total : null}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
            {!loading && !error && recommendations.length === 0 && (
              <Typography>
                {selectedDepartures && travelDate 
                  ? "No recommendations available for your criteria." 
                  : "Select your departure location and travel date to see personalized recommendations."}
              </Typography>
            )}
          </Grid>
        </Grid>
      </ThemeProvider>
    );
  }

export default Recommendations;