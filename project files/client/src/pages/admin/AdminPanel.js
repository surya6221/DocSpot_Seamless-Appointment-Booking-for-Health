import React, { useState } from 'react'; // Added useState for Snackbar
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Container, Typography, Box, Tabs, Tab,
  Snackbar, Alert // Added Snackbar and Alert
} from '@mui/material';

export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the current tab based on the URL path
  const currentTab = location.pathname.includes('/admin/users') ? '/admin/users' : '/admin/doctors';

  // Snackbar state for general messages (can be used for errors/success from child components)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    // Background Layer - This Box provides the full-screen background and the scroll
    <Box
      sx={{
        position: 'fixed', // Fixed to cover the whole viewport
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url("/images/dashboard-background.png")', // Make sure this image exists in public/images/
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Keeps background fixed during scroll
        zIndex: -1,
        overflowY: 'auto', // ONLY SCROLL VERTICALLY if content overflows
        overflowX: 'hidden', // Prevent horizontal scroll
      }}
    >
      <Container maxWidth="lg" sx={{
        // Adjusted padding-top for better spacing from the top bar (e.g., if there's a fixed navbar)
        pt: { xs: 8, sm: 10 },
        pb: 4, // Add padding bottom for content
        mt: 0, // Ensure no top margin pushing it down
        mb: 4, // Add margin bottom for content
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly transparent white background for content
        borderRadius: 2,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        px: 4, // Horizontal padding
        py: 4, // Vertical padding (additional to pt/pb)
        minHeight: 'calc(100vh - 64px - 4rem)', // Adjust based on header height and desired bottom margin
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.dark', mb: 3 }}>
          Admin Panel
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="admin navigation tabs">
            <Tab label="Doctors" value="/admin/doctors" />
            <Tab label="Users (Appointments)" value="/admin/users" />
          </Tabs>
        </Box>
        {/* Outlet renders the child routes (AdminDoctors or AdminUsers) */}
        <Outlet />
      </Container>

      {/* Snackbar for general messages */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}