import React from 'react';
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
//redux import
import { useSelector, useDispatch } from 'react-redux'
import { userLogin, userLogout  } from '../../store/loginSlice'
import { userLI, userLO  } from '../../store/userSlice'

//navbar import
import Navbar from '../navbar';

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

function About() {
    const [mode, setMode] = React.useState('dark');
    const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
    const navigate = useNavigate();
    // redux login state
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

    return (
        <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Grid container spacing={2} p={4}>
            <Grid item xs={12} p={0}>
                <Typography variant="h4" textAlign={'center'} sx={{ 
                    fontWeight: 1000, 
                    fontSize: 50,
                    mb: 4
                }}>
                    ABOUT US
                </Typography>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Grid item xs={8}>
                    <Box >
                        <Typography variant="h4" color="primary" sx={{ 
                            mb: 4,
                            textAlign: 'center',
                            fontWeight: 300
                        }}>
                            Hi there, thanks for stopping by!
                        </Typography>
                      <Paper sx={{p:3}}>
                        <Typography variant="h5" sx={{ 
                            color: '#b3cde0', 
                            mt: 1, 
                            mb: 3,
                            fontWeight: 500 
                        }}>
                            OUR ORIGIN
                        </Typography>
                        <Typography variant="h6" sx={{ 
                            mb: 6,
                            fontWeight: 300,
                            lineHeight: 1.6
                        }}>
                            We are a group of students that can find the best recommendations for your travel plans.
                        </Typography>
                        
                        <Typography variant="h5" sx={{ 
                            color: '#b3cde0', 
                            mt: 6, 
                            mb: 4,
                            fontWeight: 500
                        }}>
                            MEET THE TEAM
                        </Typography>
                        <Grid container spacing={3}>
                            {['Fabian Bayona', 'Joseph Zhang', 'Martin Lee', 'Sean Shin', 'Seth Philp'].map((member) => (
                                <Grid item xs={12} key={member}>
                                    <Typography variant="h6" sx={{
                                        p: 2,
                                        borderLeft: '4px solid #b3cde0',
                                        pl: 4,
                                        fontWeight: 300,
                                        '&:hover': {
                                            color: 'primary.main',
                                            transition: 'color 0.3s ease'
                                        }
                                    }}>
                                        {member}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                        
                      </Paper>  
                        
                    </Box>
                </Grid>
            </Grid>
        </Grid>
    </ThemeProvider>
);
}

export default About;