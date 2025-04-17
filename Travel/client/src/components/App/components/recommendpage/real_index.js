import React, {useEffect, useState} from 'react';
import Typography from "@mui/material/Typography";
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

import Navbar from '../navbar';

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
      fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, historyRes] = await Promise.all([
          fetch('/api/user/profile', { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
          fetch('/api/user/travelHistory', { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
        ]);

        if (!profileRes.ok || !historyRes.ok) throw new Error('Failed to fetch user data');
        const profile = await profileRes.json();
        const travelHistory = await historyRes.json();
        
        //Getting the possible destinations from SQL database
        //Server.js should create API functions which fetches data such as: /api/user/profile -> SELECT username, etc
        const destinationsRes = await fetch('/api/destinations', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!destinationsRes.ok) throw new Error('Failed to fetch destinations');
        const destinations = await destinationsRes.json();
        
        //Calculating recommendations
        const recommendedDestinations = calculateRecommendations(profile, travelHistory, destinations);
        setRecommendations(recommendedDestinations.slice(0, 3)); // Top 3 recommendations
      } catch (error) {
        setError(error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const calculateRecommendations = (profile, travelHistory, destinations) => {
      // Extract user preferences from profile 
      // This should be initially stored via survey when user makes account - must remember to allow them to change later
      const { preferred_temp, preferred_safety, preferred_industry } = profile;
  
      // Calculate average preferences from past travel history
      // Should we keep is_urban as boolean? or should we create two categories to keep score of city and nature
      // Or we can do: rural 0 --- 1 urban
      const pastAverages = travelHistory.reduce(
        (acc, trip) => ({
          safety: acc.safety + trip.safety_score / travelHistory.length,
          temperature: acc.temperature + trip.avg_temperature / travelHistory.length,
          industry: acc.industry + (trip.is_urban ? 1 : 0) / travelHistory.length, 
        }),
        { safety: 0, temperature: 0, industry: 0 }
      );
  
      // Score each destination
      const scoredDestinations = destinations.map((dest) => {
        // Blend preferred and past averages (50% each)
        const safetyTarget = (preferred_safety) * 0.5 + pastAverages.safety * 0.5;
        const tempTarget = (preferred_temp) * 0.5 + pastAverages.temperature * 0.5;
        const industryTarget = (preferred_industry) * 0.5 + pastAverages.industry * 0.5;
      
        const safetyScore = dest.safety_score >= safetyTarget 
        ? 1 
        : dest.safety_score / safetyTarget;
        const tempScore = 1 - Math.abs(dest.avg_temperature - tempTarget) / 50;
        //used 50 because typically temp  will range within -20~30
        const industryScore = 1 - Math.abs(dest.is_urban - industryTarget);

        const totalScore =
          safetyScore * WEIGHTS.safety +
          tempScore * WEIGHTS.temperature +
          industryScore * WEIGHTS.industry;
      
        return {
          destination: dest.name,
          score: totalScore,
          details: {
            safety_score: dest.safety_score,
            avg_temperature: dest.avg_temperature,
            is_urban: dest.is_urban,
            description: dest.description,
          },
        };
      });
      
      // Sort by score (highest first)
      return scoredDestinations.sort((a, b) => b.score - a.score);
    };

    return (
        <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Grid container spacing={2} p={4}>
            <Grid item xs={12} p={0} l = {4}>
                <Typography variant="h4" textAlign={'center'} sx={{ fontWeight: 1000, fontSize: 50}}> &nbsp;RECOMMENDATIONS</Typography>
            </Grid>
        </Grid>
        </ThemeProvider>
    );
}

//export default Recommendations;