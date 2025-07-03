import React from 'react';
import { Box } from '@mui/material';

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)', // Adjust for Navbar height (assuming 64px)
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: 'url("/images/home-background.jpg")', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white', // Text color for better contrast against the background
        textAlign: 'center',
        padding: 3,
        overflow: 'hidden',
      }}
    >
    </Box>
  );
}
