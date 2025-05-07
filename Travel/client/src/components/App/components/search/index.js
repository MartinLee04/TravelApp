import React, {useState} from 'react';
import Typography from "@mui/material/Typography";
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, getNativeSelectUtilityClasses, InputAdornment } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronLeft';
import axios from 'axios'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import FlightCard from './flightCard'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import CardMedia from '@mui/material/CardMedia';
import Card from '@mui/material/Card';
//redux import
import { useSelector, useDispatch } from 'react-redux'
import { userLogin, userLogout  } from '../../store/loginSlice'
import { userLI, userLO  } from '../../store/userSlice'

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';

import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

import {localpath} from '../../localpath'
import dayjs from 'dayjs';
import LoadingScreen from './loadingImg';
import Navbar from '../navbar';


const getDesignTokens = (mode) => ({
    typography: { fontFamily: 'Montserrat' },
    palette: {
        mode,
        primary: { main: mode === 'light' ? "#E9DB5D" : "#b3cde0" },
        text: { primary: mode === 'light' ? "#000" : "#b3cde0" },
        success: { main: "#9FE2BF" },
    },
    components: {
        MuiPickersLayout: { // <-- Correct component for v6
          styleOverrides: {
            root: {
              backgroundColor: '#ffffff', // White background for picker pop-up
              color: '#000000', // Black text color
            },
            contentWrapper: {
              backgroundColor: '#ffffff', // Calendar area
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#aaa', // Default border color
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1976d2', // Border color when focused
              },
            },
          },
        },
      },
});


const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });


const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

function Filter() {
    const [mode, setMode] = React.useState('dark');
    const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
    const navigate = useNavigate();

    const [continent, setContinent] = React.useState('');
    // const [country, setCountry] = React.useState('');
    const [price, setPrice] = React.useState(0.0);
    const [languages, setLanguages] = React.useState('');
    const [temperature, setTemperature] = React.useState(0.0);
    const [industry, setIndustry] = React.useState('');
    const [safetyScore, setSafetyScore] = React.useState(1);
    const [cities, setCities] = React.useState([])
    const [origin, setOrigin] = React.useState("")

    const [dest, setDest] = React.useState("")

    // redux login state
    const loginState = useSelector(state => state.login.value)
    const userState = useSelector(state => state.user.value)
    const dispatch = useDispatch()
  
    const handleLogout= async (e) => {
      dispatch(userLO())
      dispatch(userLogout());
      navigate("/profile");
    };

     // Flight API Test

    const [searchParams, setSearchParams] = React.useState({
        originCode: '',
        destinationCode: '',
        departureDate: '',
        returnDate: '',
        cabin: 'ECONOMY',
        currency: 'USD',
        adults: 1
    });

    const [searchParamsRecom, setSearchParamsRecom] = React.useState({
      // Dates in 'YYYY-MM-DD' format
      originCode: 'YYZ',
      destinationCode: '',
      departureDate: '2025-04-05',
      returnDate: '2025-04-15',
      currency: 'USD',
      adults: 1
    });
    
    const [destinationsRecom, setDestinationsRecom] = React.useState(['YUL','BCN','LIM','JFK','ATL','CDG','IST','MIA'])
    const [recomFlights, setRecomFlights] = React.useState([])


    const [flights, setFlights] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [pickerDepDate, setPickerDepDate] = React.useState(null)
    const [pickerArrDate, setPickerArrDate] = React.useState(null) 
    const [pickerError, setPickerError] = React.useState("")

    const [selectError, setSelectError] = React.useState(false)


    const handleInputChange = (e) => {
        const { id, value } = e.target;
        console.log(`Updating ${id} to:`, value); // Debugging log
        setSearchParams({ ...searchParams, [id]: value });
    };

    const handlePickerError = (e) => {
      if (e) {
        setPickerError("Please input a valid return date")
      }
      else {
        setPickerError("")
      }
    }

    React.useEffect(() => {
      const fetchCities = async () => {
        try {
          const res = await fetch(localpath+'/api/getTravelDestinations', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!res.ok) throw new Error('Failed to fetch cities');
          const data = await res.json();
          console.log("hi")
          setCities(data.map(dest => ({ label: `${dest.city} (${dest.airport_codes.slice(2,5)})`, code: dest.airport_codes.slice(2,5) })));
        } catch (err) {
          console.error(err);
        }
      };
      fetchCities();
    }, []);

    // const getCityName = async (cityCode) => {
    //     setLoading(true); // Start loading state
    //     try {
    //       // Send cityCode as part of the request body
    //       // Change link to corresponding host url
    //       // eg. https://musical-invention-4x7449rprpx2p7j-3000.app.github.dev/search-city
    //       const responseCity = await axios.post(
    //         'https://humble-goldfish-7wp5x55r5p63xvrw-3000.app.github.dev/search-city',
    //         { airportCode: cityCode } // Wrap cityCode in an object
    //       );
    //       console.log('gygy')
      
    //       // Update state with the received city name
    //       setOriginName(responseCity.data);
    //     } catch (error) {
    //         console.log('llll')
    //       console.error('Error fetching city name:', error);
    //     }
        
      
    //     setLoading(false); // End loading state
    //   };
    
    const [open, setOpen] = useState(true);
    const [drawerWidth, setdWidth] = useState(260);

    const toggleDrawer = () => {
      setOpen(!open);
      if(open){
        setdWidth(0)
      } else{
        setdWidth(240)
      }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFlights([]);
        
        // Check if both dates are selected and valid
        if (!pickerDepDate || !pickerArrDate) {
          setPickerError("Please select both departure and return dates");
          if (!origin || !dest) {
            setSelectError(true);
          } else{
            setSelectError(false)
          }
          return;
        }
        
        if (pickerDepDate > pickerArrDate) {
          setPickerError("Return date must be after departure date");
          return;
        }

        if (!origin || !dest) {
          setSelectError(true);
          setPickerError("");
          return;
        }

        
        setLoading(true);
        setPickerError(""); // Clear any errors
        setSelectError(false)
        
        console.log("Submitting search with params:", searchParams);

        try {
            const web_url = 'http://localhost:5000/search-flights';
            const response = await axios.post(web_url, searchParams);
            console.log("API response:", response.data);
            setFlights(response.data);
        } catch (error) {
            console.error('Error fetching flights:', error);
        }
        
        setLoading(false);
    };

    const recomTest = async (e) => {
      e.preventDefault();
      setLoading(true);
    
      console.log(searchParamsRecom);
    
      try {
        const requests = destinationsRecom.map(destinationCode => {
          const updatedParams = {
            ...searchParamsRecom,
            destinationCode,
          };
          return axios.post(
            'https://psychic-orbit-pj7qxvgpv9p36w7p-3000.app.github.dev/search-flights-recommendations',
            updatedParams
          );
        });
    
        const responses = await Promise.all(requests);
    
        const newRecomFlights = responses.map(response => response.data[0]);
        setRecomFlights(prev => [...prev, ...newRecomFlights]);
    
        responses.forEach((response, index) => {
          console.log('Response for destination:', destinationsRecom[index], response.data);
        });
      } catch (error) {
        console.error('Error fetching flights:', error);
      } finally {
        setLoading(false);
      }
    };


    return (
        <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open = {open}
        ><DrawerHeader>
                <Typography textAlign={"center"} sx={{paddingTop: 2, paddingLeft:2}}>SEARCH FLIGHTS &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Typography>
                <IconButton onClick={toggleDrawer}>
                  <ChevronLeftIcon />
                </IconButton>
              </DrawerHeader>
              
              <Divider />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
              <List>

              <Typography textAlign={"left"} paddingLeft={2} paddingTop={3}>FROM {'>'} TO</Typography> 
                <ListItem key={"OC"} paddingLeft = {2}>
                  <Autocomplete
                    fullWidth
                    id="originCode"
                    options={cities}
                    getOptionLabel={(option) => option.label ? option.label : "From"}
                    value={dest}
                    onChange={(event, newValue) => {
                      setDest(newValue)
                      handleInputChange({ target: { id: "originCode", value: newValue ? newValue.code : ""}})
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Departure Location" 
                        placeholder="Select your departure airport" 
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
                </ListItem>
                <ListItem key={"OC"} paddingLeft = {2} justifyContent='center'>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<KeyboardDoubleArrowDownIcon/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <KeyboardDoubleArrowUpIcon/>
                </ListItem>
                <ListItem key={"OC"} paddingLeft = {2}>
                  <Autocomplete
                    fullWidth
                    id="destinationCode"
                    options={cities}
                    getOptionLabel={(option) => option.label ? option.label : "To"}
                    value={origin}
                    onChange={(event, newValue) => {
                      setOrigin(newValue)
                      handleInputChange({ target: { id: "destinationCode", value: newValue ? newValue.code : ""}})
                    }}
                    
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Arrival Location" 
                        placeholder="Select your arrival airport" 
                        
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
                  
                </ListItem>
                <ListItem key={"OC"} paddingLeft = {2}>
                  {selectError?
                    <>
                      <Alert severity="warning">Ensure that Origin & Destination codes are valid.</Alert>
                    </>:<></>

                  }
                  
                </ListItem>

                <Divider variant="middle" sx={{ marginTop: '16px' }}/>

                <Typography textAlign={"left"} paddingLeft={2} paddingTop={3}>TRAVEL DATES</Typography> 
                <ListItem key={"OC"} paddingLeft = {2} paddingTop = {2}>
                  <br></br>
                  <DatePicker
                    label="Departure Date"
                    slotProps={{
                        textField: {
                        id: "departureDate",
                          sx: {
                            input: {
                                color: "#b3cde0", // <-- your desired font color
                              },
                            "& .MuiInputLabel-root": {
                                color: "#b3cde0", // Label default font color
                            },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#b3cde0', // Default border color
                              },
                              '&:hover fieldset': {
                                borderColor: '#b3cde0', // Border color on hover
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#b3cde0', // Border color when focused
                              },
                            },
                            "& .MuiSvgIcon-root": {
                                color: "#b3cde0", // Change the color of the calendar icon
                              },
                        }}
                    }}
                    onChange={(newValue) =>{
                        handleInputChange({ target: { id: "departureDate", value: newValue.toISOString().substring(0, 10)}})
                        setPickerDepDate(newValue)
                      }}
                    disablePast
                    />
                </ListItem>
                <ListItem key={"OC"} paddingLeft = {2} paddingTop = {2}>
                  <DatePicker
                  label="Return Date"
                  slotProps={{
                      textField: {
                          id: "returnDate",
                        sx: {
                          input: {
                              color: "#b3cde0", // <-- your desired font color
                            },
                          "& .MuiInputLabel-root": {
                              color: "#b3cde0", // Label default font color
                          },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#b3cde0', // Default border color
                            },
                            '&:hover fieldset': {
                              borderColor: '#b3cde0', // Border color on hover
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#b3cde0', // Border color when focused
                            },
                            
                          },
                          "& .MuiSvgIcon-root": {
                              color: "#b3cde0", // Change the color of the calendar icon
                          },
                            "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#b3cde0", // Change border color here
                          },
                          // Change font color for disabled state
                          "& .MuiInputBase-input.Mui-disabled": {
                            color: "#b3cde0", // Change font color here
                          },
                      }}
                  }}
                  onChange={(newValue) => {
                      if (newValue) {
                        setSearchParams(prev => ({
                          ...prev,
                          returnDate: newValue.toISOString().substring(0, 10)
                        }));
                        setPickerArrDate(newValue);
                      }
                  }}
                  onError={handlePickerError}
                  disabled={!pickerDepDate}
                  minDate={pickerDepDate}
                  />

                </ListItem>
                <ListItem key={"OC"} paddingLeft = {2}>
                  {pickerError?
                    <div>
                      <Alert severity="warning">{pickerError}</Alert>
                    </div>:<div></div>
                  }
                  
                </ListItem>
               

                <Divider variant="middle" sx={{ marginTop: '16px' }}/>
                
                <Typography textAlign={"left"} paddingLeft={2} paddingTop={3}>PREFERRED CABIN</Typography> 
                <ListItem key={"OC"} paddingLeft = {2} paddingTop = {2} y = {20}>
                  <FormControl sx={{minWidth: 225 }}>
                  <InputLabel id="cabin">Cabin</InputLabel>
                  <Select
                    id="cabin"
                    value= {searchParams.cabin}
                    label="Cabin"
                    fullWidth
                    
                    onChange= {(newValue) =>
                      handleInputChange({ target: { id: "cabin", value: newValue.target.value}})
                    }
                    
                    
                  >

                    <MenuItem value={'ECONOMY'}>ECONOMY CLASS</MenuItem>
                    <MenuItem value={'PREMIUM_ECONOMY'}>PREMIUM ECONOMY</MenuItem>
                    <MenuItem value={'BUSINESS'}>BUSINESS CLASS</MenuItem>
                    <MenuItem value={'FIRST'}>FIRST CLASS</MenuItem>

                  </Select>
                  </FormControl>
                </ListItem>

                <Divider variant="middle" sx={{ marginTop: '16px' }}/>
                
                <Typography textAlign={"left"} paddingLeft={2} paddingTop={3}>PREFERRED CURRENCY</Typography> 
                <ListItem key={"OC"} paddingLeft = {2} paddingTop = {2} y = {20}>
                  <FormControl sx={{minWidth: 225 }}>
                  <InputLabel id="currency">currency</InputLabel>

                  <Select
                    id="currency"
                    value= {searchParams.currency}
                    label="Currency"
                    fullWidth
                    onChange= {(newValue) =>
                      handleInputChange({ target: { id: "currency", value: newValue.target.value}})
                    }
                  >

                    <MenuItem value={'USD'}>USD</MenuItem>
                    <MenuItem value={'CAD'}>CAD</MenuItem>
                    <MenuItem value={'EUR'}>EUR</MenuItem>
                    <MenuItem value={'GBP'}>GBP</MenuItem>
                    <MenuItem value={'COP'}>COP</MenuItem>
                    <MenuItem value={'MXN'}>MXN</MenuItem>
                    <MenuItem value={'JPY'}>JPY</MenuItem>
                    <MenuItem value={'CNY'}>CNY</MenuItem>
                  </Select>
                  </FormControl>
                </ListItem>
                
                <Divider variant="middle" sx={{ marginTop: '16px', marginBottom: '16px' }}/>
                
                <ListItem key={"OC"} paddingLeft = {2} paddingTop = {8}>
                <Button onClick={handleSubmit}
                  id="search-button"
                  sx={{minWidth: 225 }}
                  variant="contained">
                      {loading ? 'Searching...' : 'Search Flights'}
                  
                </Button>
                </ListItem>
              </List>
              </LocalizationProvider>
            </Drawer>

        <Grid container spacing={2} p={2} paddingTop={12} sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`}}>
          {open?
          <></>:
          <IconButton onClick={toggleDrawer}>
            <ChevronRightIcon />
          </IconButton>
          }
          
          {loading ? 
          <Grid item xs={12} paddingTop={10} textAlign="center" sx={{marginTop:"-60px"}}>
            <LoadingScreen />
          </Grid>:
          <>
            <Grid item xs={12} textAlign="left" paddingTop={4}>
              <Typography variant="h4" sx={{ fontWeight: 1000, fontSize: 50 }}>SEARCH FLIGHTS</Typography>
                <Paper sx={{ padding: '16px', marginTop:"16px"}}>
                  <li><Typography variant="p"><b>HOW TO USE:</b> simply open up the menu bar and enter your desired flight details.</Typography></li>
                  <li><Typography variant="p"><b>EDIT SEARCH:</b> change the factor you want and hit search again</Typography></li>
                  <li><Typography variant="p"><b>RESULTS:</b> resultant flights corresponding to your preferences will show up below</Typography></li>
                  <KeyboardDoubleArrowDownIcon/>
                </Paper>
            </Grid>
            <Grid item xs={12} textAlign="left" paddingTop={4}>
              {flights.length > 0 && (
                  <>
                  <Typography variant="h5">RESULTS</Typography>
                  </>
              )}  
            </Grid>
            
            <Grid item xs={12} sx={{marginTop:"16px", maxHeight: 500, height:500, overflowY: "scroll"}}>
              {/* flights.lenght */}
              {flights.length > 0 ? (
                <>
                  <FlightCard flights={flights} />
                  {console.log("Rendering flights:", flights)} {/* Debugging log */}
                </>
              ) :
                <Typography>No flights displayed.</Typography>
              }
            </Grid>
          </>}

        </Grid>

        </ThemeProvider>
    );
}

export default Filter;