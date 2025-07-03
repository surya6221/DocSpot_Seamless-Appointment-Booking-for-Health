import React, { useEffect, useState } from 'react';
import {
  Typography, Paper, Table, TableContainer, TableHead,
  TableRow, TableCell, TableBody, Alert, Button, Box, Snackbar, Chip // Added Box, Snackbar, Chip
} from '@mui/material';
import { styled } from '@mui/system';
import api from '../../services/api.js'; // Ensure path is correct
import { Visibility as VisibilityIcon } from '@mui/icons-material';

// Styled TableRow for conditional coloring
const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  // Default background
  backgroundColor: theme.palette.background.paper,
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover, // Slightly different for odd rows
  },
  // Conditional styling based on status
  ...(status === 'pending' && {
    backgroundColor: '#fff3cd', // Light yellow for pending
    '&:hover': {
      backgroundColor: '#ffeeba',
    },
  }),
  ...(status === 'scheduled' && {
    backgroundColor: '#d4edda', // Light green for scheduled
    '&:hover': {
      backgroundColor: '#c3e6cb',
    },
  }),
  ...(status === 'completed' && {
    backgroundColor: '#e2e3e5', // Light grey for completed
    '&:hover': {
      backgroundColor: '#d6d8db',
    },
  }),
  ...(status === 'cancelled' && {
    backgroundColor: '#f8d7da', // Light red for cancelled
    '&:hover': {
      backgroundColor: '#f5c6cb',
    },
  }),
}));

export default function AdminUsers() {
  const [appointments, setAppointments] = useState([]);
  // Removed local error state as Snackbar will handle all feedback now

  // Snackbar state for user feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'


  const fetchAllAppointments = React.useCallback(() => {
    try {
      api.get('/admin/appointments') // This endpoint fetches all appointments
        .then(res => setAppointments(res.data))
        .catch(err => showSnackbar(err.response?.data?.error || 'Failed to fetch appointments.', 'error')); // Use Snackbar
    } catch (err) {
      showSnackbar('An unexpected error occurred while fetching appointments.', 'error');
      console.error("Error fetching appointments:", err);
    }
  }, []); // useCallback with empty dependency array for stable function

  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]); // Add fetchAllAppointments to dependency array

  // Snackbar handlers
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleDocumentView = (documentUrl) => {
    if (documentUrl) {
      window.open(`http://localhost:5000${documentUrl}`, '_blank');
    } else {
      showSnackbar('No document uploaded for this appointment.', 'warning'); // Replaced alert with Snackbar
    }
  };

  // Helper to get status color for Chip (for consistency, though table cell can be colored too)
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'scheduled': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };


  return (
    // AdminUsers will be rendered as a child of AdminPanel,
    // so it doesn't need its own background Box or top-level container styling.
    // It will inherit the background and spacing from AdminPanel.
    <Box sx={{ flexGrow: 1 }}> {/* FlexGrow ensures it takes available space */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.secondary' }}>
          All Appointments
        </Typography>
      </Box>

      {/* Error messages are now handled by Snackbar */}
      {appointments.length === 0 ? (
        <Typography sx={{ ml: 2, color: 'text.secondary' }}>No appointments found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)' }}>
          <Table sx={{ minWidth: 650 }} aria-label="appointments table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}> {/* Header row styling */}
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Appointment ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Patient Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Doctor Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Document</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <StyledTableRow
                  key={appointment._id}
                  status={appointment.status} // Pass status prop to StyledTableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2">{appointment._id}</Typography> {/* Smaller font for ID */}
                  </TableCell>
                  <TableCell>{appointment.user?.name || 'N/A'}</TableCell>
                  <TableCell>{appointment.doctor?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusChipColor(appointment.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    {appointment.documentUrl ? (
                      <Button
                        onClick={() => handleDocumentView(appointment.documentUrl)}
                        startIcon={<VisibilityIcon />}
                        size="small"
                        variant="outlined" // Consistent button style
                        sx={{
                          borderRadius: 1,
                          borderColor: 'info.main',
                          color: 'info.main',
                          '&:hover': {
                            backgroundColor: 'info.light',
                            color: 'info.contrastText',
                            borderColor: 'info.main',
                          },
                        }}
                      >
                        View
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Snackbar for general messages */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}