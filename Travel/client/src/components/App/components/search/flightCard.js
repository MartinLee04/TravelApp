import React, { useEffect } from 'react';
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import dayjs from 'dayjs';
import { Card, CardContent, Collapse } from '@mui/material';
import Divider from '@mui/material/Divider';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useSelector, useDispatch } from 'react-redux'
import { userLogin, userLogout  } from '../../store/loginSlice'
import { userLI, userLO  } from '../../store/userSlice'

import {localpath} from '../../localpath'

const FlightCard = (props) => {

    const [expandedId, setExpandedId] = React.useState(-1)
    const [selectedFlight, setSelectedFlight] = React.useState({});
    const [clicked, setClicked] = React.useState([])
    const [updateSaved, setUpdateSaved] = React.useState(-1)
    const userState = useSelector(state => state.user.value)
    
    const handleExpandClick = (i) => {
        setExpandedId(expandedId === i ? -1 : i);
      };

    const { parse } = require('iso8601-duration');
    const [prevPrice, setPrevPrice] = React.useState(0);

    useEffect(() => {
        if (props.flights.length > 0) {
          setPrevPrice(props.flights[0].price.total); 
        }
      }, [props.flights]);

    console.log(props.flights)

    const convertDuration = (isoDuration) => {
        const parsed = parse(isoDuration); // Parse the ISO 8601 duration string
        const days = parsed.days || 0;
        const hours = parsed.hours || 0;
        const minutes = parsed.minutes || 0;
        const result = [days,hours,minutes]
        return result;
    };

    function formatTo12HourTime(isoString) {
        return dayjs(isoString).format('hh:mm A'); // Format as hh:mm AM/PM
    }

    const getFullTimeString = ([days,hours,minutes]) => {

        return `${days? `${days} Days, ` : ''}${hours ? `${hours} hours` : ''}${minutes ? `, ${minutes} minutes` : ''}`
    }

    const getStringStops = (num) => {
        if (num === 1) {
            return 'Direct Flight'
        }
    
        if (num === 2) {
            return '1 Stop'
        } else {
            return `${num-1} Stops`
        }
    }

    const handleSaveFlight = async (itemId) => {
        if(userState[0].username && userState[0].id){
            console.log("Saving flight with ID:", itemId);
            const item = props.flights.find((item) => item.id === itemId); // Find the item by id
            
            // Update UI to show saved state
            if(!clicked.includes(itemId)){
                setClicked([...clicked, itemId]);
                setUpdateSaved(itemId);
            } else {
                return; // Already saved
            }

            try {
                // Always save as a round trip flight
                const flightData = {
                    account_id: userState[0].id, 
                    origin_code: item.itineraries[0].segments[0].departure.iataCode, 
                    dep_code: item.itineraries[0].segments[item.itineraries[0].segments.length - 1].arrival.iataCode, 
                    dep_date: item.itineraries[0].segments[0].departure.at, 
                    ret_date: item.itineraries[1].segments[item.itineraries[1].segments.length-1].arrival.at, 
                    dep_time: formatTo12HourTime(item.itineraries[0].segments[0].departure.at), 
                    ret_time: formatTo12HourTime(item.itineraries[1].segments[0].departure.at), 
                    segments: getStringStops(item.itineraries[1].segments.length), 
                    price: item.price.total, 
                    currency: item.price.currency
                };
                
                // Make API call to save flight
                const response = await fetch(localpath+'/api/addUserFlight', {
                    method: "POST",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(flightData)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save flight');
                }
                
                const data = await response.json();
                console.log("Flight saved successfully:", data);
                
            } catch (error) {
                console.error('Error saving flight:', error);
                alert("Error saving flight. Please try again.");
                
                // Remove from clicked if save failed
                setClicked(clicked.filter(id => id !== itemId));
            }
        } else {
            alert("Please login to save flights (via the profile page)");
        }
    };

    return(
        <>
        <Typography variant="h6">
        From {props.flights[0].itineraries[0].segments[0].departure.iataCode} To{' '}
        {props.flights[0].itineraries[0].segments[props.flights[0].itineraries[0].segments.length - 1].arrival.iataCode}
        </Typography>

        {props.flights.map((flight, i) => (
            props.flights.price !== prevPrice &&(
            <Grid item xs={12} md={12} lg={12}>
                <Card sx={{ marginBottom: 2, boxShadow: 3 }}>
                <CardContent>
                <Grid container alignItems="center" justifyContent="space-between">
                <Grid item s={8} md={8} lg={8} pr={3}>
                    <Grid item s={12} md={12} lg={12}>
                        <strong>Departing flight:</strong>
                    </Grid>
                    <Typography variant="h6">
                    {formatTo12HourTime(flight.itineraries[0].segments[0].departure.at)} - {formatTo12HourTime(flight.itineraries[0].segments[flight.itineraries[0].segments.length-1].arrival.at)}
                    </Typography>
                    {/* Option {index+1} Price: {flight.price.total} {flight.price.currency} */}
                    <Grid item s={12} md={12} lg={12}>
                        <Grid>
                            {flight.itineraries[0].segments[0].departure.iataCode} to {flight.itineraries[0].segments[flight.itineraries[0].segments.length -1].arrival.iataCode} &nbsp;&nbsp; {getStringStops(flight.itineraries[0].segments.length)}
                        </Grid>
                    </Grid>

                    {flight.itineraries.length > 1 ? (
                        <>
                    <Divider/>
                    <Grid item s={12} md={12} lg={12}  pt={2}>
                        <strong>Returning flight:</strong>
                    </Grid>
                    <Typography variant="h6">
                    {formatTo12HourTime(flight.itineraries[1].segments[0].departure.at)} - {formatTo12HourTime(flight.itineraries[1].segments[flight.itineraries[1].segments.length-1].arrival.at)}
                    </Typography>
                    <Grid item s={12} md={12} lg={12} pb={1}>
                        <Grid>
                            {flight.itineraries[1].segments[0].departure.iataCode} to {flight.itineraries[1].segments[flight.itineraries[1].segments.length -1].arrival.iataCode} &nbsp;&nbsp; {getStringStops(flight.itineraries[1].segments.length)}
                        </Grid>
                    </Grid>
                    </>
                    ) : null}
                    
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ marginBottom: 1 }}
                        onClick={() => handleExpandClick(i)}
                        aria-expanded={expandedId === i}
                        aria-label="show more" 
                        >
                        View Details
                    </Button>
                </Grid>
                {/* <hr style={{ border: "1px dashed #555", margin: "16px 0" }} /> */}
                
                <Grid
                    item
                    s={3}
                    md={3}
                    lg={3}
                    container
                    direction="column"
                    alignItems="flex-end"
                    justifyContent="right"
                >
                    <Typography variant="h5" color="primary" gutterBottom>
                    ${flight.price.total} {flight.price.currency}
                    </Typography>
                    
                    {/* Only show Save button if user is logged in */}
                    {userState[0].id && userState[0].username ? (
                        <>
                            {clicked.includes(flight.id) ? (
                                <Button 
                                    variant="contained" 
                                    color="success" 
                                    startIcon={<FavoriteIcon />}
                                    sx={{ mb: 1 }}
                                >
                                    Saved
                                </Button>
                            ) : (
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={() => handleSaveFlight(flight.id)}
                                    sx={{ mb: 1 }}
                                >
                                    Save Flight
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button 
                            variant="outlined" 
                            color="primary"
                            component="a"
                            href="/profile"
                            sx={{ mb: 1 }}
                        >
                            Login to Save
                        </Button>
                    )}
                </Grid>
            </Grid>
             <Collapse in={expandedId ===i} timeout="auto" unmountOnExit>
                <CardContent>
                    <Grid item s={12} md={12} lg={12}>
                        <strong>Departing flight:</strong>
                    </Grid>
                     {flight.itineraries[0].segments.map((segment,index) => (
                        <Grid item s={12} md={12} lg={12}>
                            <Grid>
                                <Typography variant="h6">
                                    {formatTo12HourTime(segment.departure.at)} From: {segment.departure.iataCode} 
                                </Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="caption">
                                    {getFullTimeString(convertDuration(segment.duration))}
                                </Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="h6">
                                    {formatTo12HourTime(segment.arrival.at)} To: {segment.arrival.iataCode}
                                </Typography>
                            </Grid>
                            <Divider/>
                        </Grid>
                    ))}
                    {flight.itineraries.length > 1 ? (
                        <>
                    <Grid item s={12} md={12} lg={12} pt={3}>
                        <strong>Returning flight:</strong>
                    </Grid>
                    {flight.itineraries[1].segments.map((segment, index) => (
                        <Grid item s={12} md={12} lg={12} key={`return-${index}`}>
                            <Grid>
                                <Typography variant="h6">
                                    {formatTo12HourTime(segment.departure.at)} From: {segment.departure.iataCode}
                                </Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="caption">
                                    {getFullTimeString(convertDuration(segment.duration))}
                                </Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="h6">
                                    {formatTo12HourTime(segment.arrival.at)} To: {segment.arrival.iataCode}
                                </Typography>
                            </Grid>
                            <Divider />
                        </Grid>
                    ))}
                    </>
                    ) : null}
                </CardContent>
             </Collapse>

                </CardContent>
                </Card> 
            </Grid>
            )
        ))}
        </>
    );

};

export default FlightCard;