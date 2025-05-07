import React, { useEffect, useState } from 'react';
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import HomeIcon from '@mui/icons-material/Home';
import { Select, MenuItem, Slider, Card, CardContent } from "@mui/material";
//redux import
import { useSelector, useDispatch } from 'react-redux';
import { userLogin, userLogout } from '../../store/loginSlice';
import { userLI, userLO } from '../../store/userSlice';

//navbar import
import Navbar from '../navbar';

import {localpath} from '../../localpath'

const getDesignTokens = (mode) => ({
  typography: {
    fontFamily: 'Montserrat',
  },
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {main: "#E9DB5D"},
          text: {
            primary: "#000",
          },
        }
      : 
      {
        primary: { main: "#b3cde0"},
        success: { main: "#9FE2BF"},
        text: {
          primary: '#b3cde0',
        },
      }),
  },
});

export default function Search() {
  const [mode, setMode] = React.useState('dark');
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  const navigate = useNavigate();

  // State for filter options
  const [data, setData] = useState([]);
  const [uniqueLanguages, setUniqueLanguages] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSafety, setSelectedSafety] = useState("");
  const [priceRange, setPriceRange] = useState([50, 4000]);
  const [tempRange, setTempRange] = useState([-20, 40]);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  // redux login state
  const loginState = useSelector(state => state.login.value);
  const userState = useSelector(state => state.user.value);
  const dispatch = useDispatch();

  const handleLogout = async (e) => {
    dispatch(userLO());
    dispatch(userLogout());
    navigate("/profile");
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        // Get current month (0-11 where 0 is January)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        
        // Use the existing endpoint that returns travel_destinations table data
        const response = await fetch(localpath+'/api/getCurentTravelDestinations');
        if (!response.ok) {
          throw new Error('Failed to fetch destinations');
        }
        const fetchedData = await response.json();

        // Format data based on your actual table structure
        const formattedData = fetchedData.map((dest) => {
          // Parse arrays if they're stored as strings
          let airportCodes = dest.airport_codes;
          let hotelPrices = dest.hotel_prices;
          let temperatures = dest.avg_monthly_temps;
          
          // Handle string format if needed (depending on how MySQL returns JSON arrays)
          if (typeof dest.airport_codes === 'string') {
            try {
              airportCodes = JSON.parse(dest.airport_codes);
            } catch {
              // Handle potential format issues
              airportCodes = dest.airport_codes.replace(/[\[\]"']/g, '').split(', ');
            }
          }
          
          if (typeof dest.hotel_prices === 'string') {
            try {
              hotelPrices = JSON.parse(dest.hotel_prices);
            } catch {
              hotelPrices = dest.hotel_prices.replace(/[\[\]"']/g, '').split(', ').map(Number);
            }
          }
          
          if (typeof dest.avg_monthly_temps === 'string') {
            try {
              temperatures = JSON.parse(dest.avg_monthly_temps);
            } catch {
              temperatures = dest.avg_monthly_temps.replace(/[\[\]"']/g, '').split(', ').map(Number);
            }
          }
          
          return {
            id: dest.destination_id || dest.id,
            city_name: dest.city || dest.city_name,
            country: dest.country,
            continent: dest.continent,
            // Use current month's values for price and temperature
            price: Array.isArray(hotelPrices) ? hotelPrices[currentMonth] : dest.hotel_prices,
            safety: dest.safety_score,
            temperature: Array.isArray(temperatures) ? temperatures[currentMonth] : dest.avg_monthly_temps,
            language: dest.language,
            isUrban: dest.isUrban,
            airport_codes: Array.isArray(airportCodes) ? airportCodes.join(', ') : dest.airport_codes
          };
        });

        setData(formattedData);

        // Extract unique languages
        const languages = [...new Set(formattedData.map(item => item.language))];
        setUniqueLanguages(languages);
      } catch (error) {
        console.error('Error fetching destinations:', error);
      }
    };

    fetchCities();
  }, []);

  // Filtered data based on selected filters
  const filteredData = data.filter(item => 
    (selectedCountry ? item.country === selectedCountry : true) &&
    (selectedSafety ? item.safety >= Number(selectedSafety) : true) &&
    item.price >= priceRange[0] && item.price <= priceRange[1] &&
    item.temperature >= tempRange[0] && item.temperature <= tempRange[1] &&
    (selectedLanguage ? item.language === selectedLanguage : true)
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />

      <Grid container spacing={2} p={4} xs={12}>
        <Grid item xs={12} p={0}>
          <Typography variant="h4" textAlign={'center'} sx={{ fontWeight: 1000, fontSize: 50 }}> &nbsp;FILTER FEATURES</Typography>
          
          {/* Sliders come first now */}
          <Grid item xs={12} p={2} sx={{ display: 'flex', justifyContent: 'center', mb: 5, mt: 3 }}>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ marginBottom: 2, fontWeight: 1000, fontSize: 20 }}>Price Range</Typography>
                <Slider
                  min={50}
                  max={4000}
                  step={10}
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  sx={{ width: '90%' }}
                />
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ marginBottom: 2, fontWeight: 1000, fontSize: 20 }}>Temperature Range</Typography>
                <Slider
                  min={-20}
                  max={40}
                  step={1}
                  value={tempRange}
                  onChange={(e, newValue) => setTempRange(newValue)}
                  valueLabelDisplay="auto"
                  sx={{ width: '90%' }}
                />
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ marginBottom: 2, fontWeight: 1000, fontSize: 20 }}>Minimum Safety Score</Typography>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={selectedSafety || 1}
                  onChange={(e, newValue) => setSelectedSafety(newValue)}
                  valueLabelDisplay="auto"
                  sx={{ width: '90%' }}
                />
              </Grid>
            </Grid>
          </Grid>
          
          {/* Dropdown selectors with increased size */}
          <Grid container sx={{ marginBottom: 5 }}>
            {/* Headers */}
            <Grid container spacing={2} sx={{ marginBottom: 2 }}>
              <Grid item xs={6}>
                <Typography 
                  variant="h6" 
                  textAlign="center" 
                  sx={{ 
                    fontWeight: 1000, 
                    fontSize: 24 
                  }}
                >
                  COUNTRY
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography 
                  variant="h6" 
                  textAlign="center" 
                  sx={{ 
                    fontWeight: 1000, 
                    fontSize: 24 
                  }}
                >
                  LANGUAGE
                </Typography>
              </Grid>
            </Grid>

            {/* Selectors */}
            <Grid container spacing={2}>
              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Select 
                  value={selectedCountry} 
                  onChange={(e) => setSelectedCountry(e.target.value)} 
                  displayEmpty
                  sx={{ 
                    minWidth: 300,
                    '& .MuiSelect-select': { 
                      paddingY: 1.5,
                      fontSize: 18
                    }
                  }}
                >
                  <MenuItem value="">All Countries</MenuItem>
                  {data.map(item => (
                    <MenuItem key={item.id} value={item.country}>{item.country}</MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)} 
                  displayEmpty
                  sx={{ 
                    minWidth: 300,
                    '& .MuiSelect-select': { 
                      paddingY: 1.5,
                      fontSize: 18
                    }
                  }}
                >
                  <MenuItem value="">Any Language</MenuItem>
                  {uniqueLanguages.map((language, index) => (
                    <MenuItem key={index} value={language}>{language}</MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
          </Grid>

          <Grid xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>RESULTS</Typography>
            {filteredData.length > 0 ? (
              <Grid container spacing={3} justifyContent="center" maxWidth="90%">
                {filteredData.map(item => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card 
                      sx={{ 
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: 3
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{item.city_name}</Typography>
                        <Typography><strong>Country:</strong> {item.country}</Typography>
                        <Typography><strong>Continent:</strong> {item.continent}</Typography>
                        <Typography><strong>Monthly Hotel Price:</strong> ${item.price}</Typography>
                        <Typography><strong>Safety Score:</strong> {item.safety}/10</Typography>
                        <Typography><strong>Current Temperature (°C):</strong> {item.temperature}</Typography>
                        <Typography><strong>Language:</strong> {item.language}</Typography>
                        <Typography><strong>Airports:</strong> {item.airport_codes}</Typography>
                        <Typography><strong>Environment:</strong> {item.isUrban ? "Urban" : "Rural"}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>No results found.</Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}