import React from 'react';
import { Card, CardMedia, Typography, Box } from '@mui/material';
import logo from './img/LOADING.gif';

function LoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Card sx={{textAlign: 'center', boxShadow: 'none' }}>
        <CardMedia
          component="img"
          height="700"
          image={logo} // Replace with your GIF path
          alt="Loading..."
          sx={{
            objectFit: 'fill', // Ensures no cropping occurs
          }}
        />
        <Typography variant="h6" sx={{ marginTop: '16px' }}>
          Looking for the cheapest flights...
        </Typography>
      </Card>
    </Box>
  );
}

export default LoadingScreen;