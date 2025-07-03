import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  CardActions, Box, Snackbar, Chip // Added Box for background, Snackbar, and Chip
} from '@mui/material';
import api from '../services/api';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

export default function DoctorDashboard() {
  const [apps, setApps] = useState([]);
  const [confirmApprovalOpen, setConfirmApprovalOpen] = useState(false);
  const [approvalAppointmentId, setApprovalAppointmentId] = useState(null);
  const [error, setError] = useState('');

  // Snackbar state for user feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'

  const fetchAppointments = () => {
    api.get('/appointments/doctor')
      .then(res => setApps(res.data))
      .catch(err => setError(err.response?.data?.msg || 'Failed to fetch appointments.'));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

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

  const handleConfirmClick = (id) => {
    setApprovalAppointmentId(id);
    setConfirmApprovalOpen(true);
  };

  const handleConfirmAccept = async () => {
    setError('');
    try {
      await api.patch(`/appointments/${approvalAppointmentId}`, { status: 'scheduled' });
      setConfirmApprovalOpen(false);
      fetchAppointments(); // Refresh appointments
      showSnackbar('Appointment accepted successfully!', 'success');
    } catch (err) {
      setError(err.response?.data?.msg || 'Acceptance failed');
    }
  };

  const handleDocumentView = (documentUrl) => {
    if (documentUrl) {
      // Assuming your backend serves static files from http://localhost:5000
      window.open(`http://localhost:5000${documentUrl}`, '_blank');
    } else {
      showSnackbar('No document uploaded for this appointment.', 'warning');
    }
  };

  // Helper to get status color for Chip
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'info';
    }
  };


  return (
    // Background Layer
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url("/images/dashboard-background.png")', // Make sure this image exists in public/images/
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Keeps background fixed during scroll
        zIndex: -1,
        overflow: 'auto', // Allows content to scroll over the fixed background
      }}
    >
      <Container maxWidth="lg" sx={{
        // Adjusted padding-top to give more space from the navbar
        pt: { xs: 8, sm: 10 }, // Increased padding-top for better spacing from the top bar
        mb: 4, // Add margin bottom for content
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly transparent white background for content
        borderRadius: 2,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        px: 4, // Horizontal padding
        py: 4, // Vertical padding (additional to pt)
        minHeight: 'calc(100vh - 64px)', // Adjust based on header height if any
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.dark', mb: 3 }}>
          Doctor Dashboard
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}

        <Typography variant="h5" component="h2" sx={{ mt: 4, color: 'text.secondary' }}>Patient Requests (Pending)</Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {apps.filter(a => a.status === 'pending').length === 0 ? (
            <Typography sx={{ ml: 3, color: 'text.secondary' }}>No new appointment requests.</Typography>
          ) : (
            apps.filter(a => a.status === 'pending').map((a) => (
              <Grid item xs={12} sm={6} md={4} key={a._id}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    borderRadius: 2,
                    // Stronger shadow for pending requests to make them stand out
                    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #ffcc80', // Light orange border for pending
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.2)' }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}> {/* Increased padding */}
                    <Typography
                      variant="subtitle1"
                      sx={{ color: 'primary.dark', mb: 1, fontWeight: 'bold' }} // Make patient name bolder
                    >
                      Request from: {a.user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>Date:</strong> {new Date(a.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Time:</strong> {a.time}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}> {/* Use Box for alignment */}
                      <Chip
                        label={`Status: ${a.status}`}
                        color={getStatusColor(a.status)}
                        size="medium" // Made chip slightly larger
                        sx={{ textTransform: 'capitalize', fontWeight: 'bold', borderRadius: '8px' }} // More rounded
                      />
                      {a.documentUrl && (
                        <Button
                          onClick={() => handleDocumentView(a.documentUrl)}
                          startIcon={<VisibilityIcon />}
                          size="small"
                          variant="outlined" // Use outlined variant for clarity
                          sx={{
                            borderRadius: 1,
                            borderColor: 'info.main', // Custom border color
                            color: 'info.main', // Custom text color
                            '&:hover': {
                              backgroundColor: 'info.light', // Hover background
                              color: 'info.contrastText', // Hover text color
                              borderColor: 'info.main',
                            },
                          }}
                        >
                          View Document
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ mt: 'auto', p: 1, justifyContent: 'center', display: 'block', textAlign: 'center' }}> {/* Centered button */}
                    <Button
                      variant="contained"
                      onClick={() => handleConfirmClick(a._id)}
                      color="primary"
                      sx={{ borderRadius: 1 }}
                    >
                      Accept Appointment
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        <Typography variant="h5" component="h2" sx={{ mt: 5, color: 'text.secondary' }}>Scheduled Appointments</Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {apps.filter(a => a.status === 'scheduled').length === 0 ? (
            <Typography sx={{ ml: 3, color: 'text.secondary' }}>No scheduled appointments.</Typography>
          ) : (
            apps.filter(a => a.status === 'scheduled').map((a) => (
              <Grid item xs={12} sm={6} md={4} key={a._id}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    borderRadius: 2,
                    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}> {/* Increased padding */}
                    <Typography variant="subtitle1" sx={{ color: 'primary.dark', mb: 1 }}>
                      Patient: {a.user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>Date:</strong> {new Date(a.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Time:</strong> {a.time}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}> {/* Use Box for alignment */}
                      <Chip
                        label={`Status: ${a.status}`}
                        color={getStatusColor(a.status)}
                        size="medium" // Made chip slightly larger
                        sx={{ textTransform: 'capitalize', fontWeight: 'bold', borderRadius: '8px' }} // More rounded
                      />
                      {a.documentUrl && (
                        <Button
                          onClick={() => handleDocumentView(a.documentUrl)}
                          startIcon={<VisibilityIcon />}
                          size="small"
                          variant="outlined" // Use outlined variant for clarity
                          sx={{
                            borderRadius: 1,
                            borderColor: 'info.main', // Custom border color
                            color: 'info.main', // Custom text color
                            '&:hover': {
                              backgroundColor: 'info.light', // Hover background
                              color: 'info.contrastText', // Hover text color
                              borderColor: 'info.main',
                            },
                          }}
                        >
                          View Document
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                  {/* Doctor can add more actions or details for scheduled appointments here if needed */}
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Confirm Approval Dialog */}
        <Dialog
          open={confirmApprovalOpen}
          onClose={() => setConfirmApprovalOpen(false)}
        >
          <DialogTitle>Confirm Appointment Acceptance</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to accept this appointment?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmApprovalOpen(false)}>No</Button>
            <Button onClick={handleConfirmAccept} color="primary" variant="contained">Yes, Accept</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for general messages */}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

      </Container>
    </Box>
  );
}