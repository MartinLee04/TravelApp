import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import { Card, CardHeader, CardMedia, Slide } from '@mui/material';

//navbar import
import Navbar from '../navbar';

import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import HomeIcon from '@mui/icons-material/Home';

//redux import
import { useSelector, useDispatch } from 'react-redux'
import { userLogin, userLogout  } from '../../store/loginSlice'
import { userLI, userLO  } from '../../store/userSlice'

import canada from './img/canada.jpeg';
import usa from './img/usa.jpg';
import mexico from './img/mexico.avif';

const images = [
  {
    label: 'Canada',
    imgPath:
      canada,
  },
  {
    label: 'USA',
    imgPath:
      usa,
  },
  {
    label: 'Mexico',
    imgPath:
      mexico,
  }
];

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

function Landing() {
  const [mode, setMode] = React.useState('dark');
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = images.length;

  // redux login state
  const isLoggedIn = useSelector(state => state.login.value)
  const userState = useSelector(state => state.user.value)
  const dispatch = useDispatch()

  const handleLogout = async (e) => {
    dispatch(userLO())
    dispatch(userLogout());
    navigate("/profile");
  };

  const toggleMode = (step) => {
    setMode(
      mode === 'light' ? 'dark' : 'light'
    );
  };
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Grid container spacing={2} p={4}>
        <Grid item xs={12} p={0} l = {4}>
          <Typography variant="h4" textAlign={'center'} sx={{ fontWeight: 1000, fontSize: 50}}> &nbsp;TRAVELERS RECOMMENDATIONS</Typography>
          <Typography textAlign={'center'} sx={{ fontWeight: 400, fontSize: 20}}> Travel Quick. Travel Smart.</Typography>
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid item xs={4} sx = {{display: 'flex' ,justifyContent:'center',alignItems:'center'}}>
            <Box sx={{maxWidth:1000, flexGrow: 1}}>
              <Typography variant="h6" textAlign={'center'} p = {2} sx={{ fontWeight: 300, fontSize: 20}}> F E A T U R E D &nbsp;&nbsp;&nbsp; C O U N T R I E S</Typography>
              <Box
                component="img"
                sx={{
                  height: 450,
                  width: "100%",
                  maxHeight: 450,
                  maxWidth: 600,
                }}
                alt= {images[activeStep].label}
                src= {images[activeStep].imgPath}
              />
              
              <Typography textAlign={'center'} p={1}>{images[activeStep].label}</Typography>
              <MobileStepper
                steps={maxSteps}
                position="static"
                activeStep={activeStep}
                nextButton={
                  <Button
                    size="small"
                    onClick={handleNext}
                    disabled={activeStep === maxSteps - 1}
                  >
                    Next
                    {theme.direction === 'rtl' ? (
                      <KeyboardArrowLeft />
                    ) : (
                      <KeyboardArrowRight />
                    )}
                  </Button>
                }
                backButton={
                  <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                    {theme.direction === 'rtl' ? (
                      <KeyboardArrowRight />
                    ) : (
                      <KeyboardArrowLeft />
                    )}
                    Back
                  </Button>
                }
              />
            </Box>
          </Grid>
        </Grid>
        
      </Grid>
      
    </ThemeProvider>
  );
}

export default Landing;