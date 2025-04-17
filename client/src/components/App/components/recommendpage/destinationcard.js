import React from "react";
import Typography from "@mui/material/Typography";
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

const DestinationCard = React.memo(({ 
  destination, 
  showDetails, 
  onToggleDetails, 
  departureCode, 
  departureDate,
  flightPrice 
}) => (
  <Paper elevation={3} sx={{ p: 2, textAlign: 'left' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {destination.destination}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Score: {(destination.score * 100).toFixed(1)}%
        </Typography>
        <Typography variant="body2">
          Safety: {destination.details.safety_score}/10
        </Typography>
        <Typography variant="body2">
          Temp: {destination.details.avg_temperature}°C
        </Typography>
        <Typography variant="body2">
          Urban: {destination.details.is_urban ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body2">
          Hotel Price: ${destination.details.avg_hotel_price}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, mb: 1 }}>
          {destination.details.description}
        </Typography>
      </Box>
      <Button 
        variant="contained" 
        onClick={onToggleDetails}
      >
        {showDetails ? "Hide Details" : "Get Details"}
      </Button>
    </Box>
    
    {showDetails && (
      <>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">Flight Details</Typography>
          <Typography>
            <b>FROM {departureCode} to {destination.details.airport_codes}</b>
          </Typography>
          <Typography>
            Departure Date: {departureDate}
          </Typography>
          
          {flightPrice ? (
            <Typography><b>${flightPrice} USD</b></Typography>
          ) : (
            <Typography>Loading flight price information...</Typography>
          )}
          
          <Typography sx={{ mt: 2, fontSize: '0.9rem', fontStyle: 'italic' }}>
            *Note: This recommendation provides a sample flight with the cheapest price available on your specified date
          </Typography>
        </Box>
      </>
    )}
  </Paper>
));

export default DestinationCard;