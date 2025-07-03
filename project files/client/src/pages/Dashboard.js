import React, { useEffect, useState } from 'react';
import api from '../services/api.js'; // Ensure this path is correct relative to src/pages/
import { useSelector } from 'react-redux'; // Ensure react-redux is installed
import {
  Container, Typography, Grid, Card, CardContent,
  CardActions, Button, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, Alert, Snackbar,
  CardMedia, Chip,
  Box
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


// Array of placeholder doctor images (ensure these exist in public/images/)
const doctorImages = [
  '/images/doctor1.png',
  '/images/doctor2.png',
  '/images/doctor3.png',
  '/images/doctor4.png',
  '/images/doctor5.png',
];

export default function Dashboard() {
  const { user } = useSelector(state => state.auth);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [cancelAppointmentId, setCancelAppointmentId] = useState(null);

  const [confirmApprovalOpen, setConfirmApprovalOpen] = useState(false);
  const [approvalAppointmentId, setApprovalAppointmentId] = useState(null);

  // Snackbar state for user feedback (e.g., document not found)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'


  // Memoize fetchAppointments to avoid unnecessary re-creation and satisfy useEffect dependency
  const fetchAppointments = React.useCallback(() => {
    if (!user) return; // Ensure user is available before fetching

    if (user.role === 'customer') {
      api.get('/appointments')
        .then(res => setAppointments(res.data))
        .catch(err => setError(err.response?.data?.error || 'Failed to fetch customer appointments.'));
      api.get('/doctors')
        .then(res => setDoctors(res.data))
        .catch(err => setError(err.response?.data?.error || 'Failed to fetch doctors.'));
    } else if (user.role === 'doctor') {
      api.get('/appointments/doctor')
        .then(res => setAppointments(res.data))
        .catch(err => setError(err.response?.data?.error || 'Failed to fetch doctor appointments.'));
    }
  }, [user]); // fetchAppointments depends on 'user'


  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]); // Added fetchAppointments to dependency array


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

  // Modified handleBookClick to navigate to BookAppointment page
  const handleBookClick = doc => {
    navigate(`/book-appointment/${doc._id}`); // Navigate to the dedicated booking page
  };


  const handleRescheduleClick = app => {
    setRescheduleTarget(app);
    const appDate = new Date(app.date);
    const formattedDate = appDate.toISOString().split('T')[0];
    setRescheduleForm({ date: formattedDate, time: app.time });
  };

  const handleReschedule = async () => {
    setError('');
    try {
      await api.put(`/appointments/${rescheduleTarget._id}`, rescheduleForm);
      setRescheduleTarget(null);
      setRescheduleForm({ date: '', time: '' });
      fetchAppointments();
      showSnackbar('Appointment rescheduled successfully!', 'success');
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.error?.details || 'Rescheduling failed.');
    }
  };

  const handleCancelClick = (id) => {
    setCancelAppointmentId(id);
    setConfirmCancelOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await api.delete(`/appointments/${cancelAppointmentId}`);
      setConfirmCancelOpen(false);
      fetchAppointments();
      showSnackbar('Appointment cancelled successfully!', 'success');
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.error?.details || 'Cancellation failed.');
    }
  };

  const handleAcceptClick = (id) => {
    setApprovalAppointmentId(id);
    setConfirmApprovalOpen(true);
  };

  const handleAcceptConfirm = async () => {
    try {
      await api.patch(`/appointments/${approvalAppointmentId}`, { status: 'scheduled' });
      setConfirmApprovalOpen(false);
      fetchAppointments();
      showSnackbar('Appointment accepted successfully!', 'success');
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.error?.details || 'Acceptance failed.');
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
        // Adjusted padding-top for better spacing from the top bar
        pt: { xs: 8, sm: 10 },
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
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {user?.role === 'customer' && ( // Use optional chaining for user
          <>
            <Typography variant="h5" component="h5" gutterBottom sx={{ color: 'primary.dark' }}>
              Your Dashboard
            </Typography>

            <Typography variant="h5" component="h5" sx={{ mt: 2, color: 'text.secondary' }}>Available Doctors</Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {doctors.length === 0 ? (
                <Typography sx={{ ml: 3, color: 'text.secondary' }}>No doctors currently available.</Typography>
              ) : (
                doctors.map((d, index) => (
                  <Grid item xs={12} sm={6} md={4} key={d._id}>
                    <Card
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        borderRadius: 2,
                        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': { transform: 'translateY(-5px)' }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="140" // This height will define the circle's diameter if width is also set or implied
                        image={doctorImages[index % doctorImages.length]}
                        alt={`Dr. ${d.name}`}
                        sx={{
                          // Make the image circular
                          borderRadius: '50%', // Key property for circular shape
                          width: 140, // Set width equal to height for a perfect circle
                          objectFit: 'cover', // Ensures the image covers the circular area
                          // If heads are being cut off, adjust object-position
                          objectPosition: 'center top', // Try 'top' or 'center top' to focus on the upper part of the image
                          margin: '0 auto', // Center the circular image horizontally within the Card
                          mt: 2, // Add some top margin to separate it from the top of the card
                          mb: 1, // Add some bottom margin to separate it from text
                          border: '2px solid #e0e0e0', // Optional: subtle border
                        }}
                      />

                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div" sx={{ mb: 1, color: 'primary.main' }}>
                          Dr. {d.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Specialty:</strong> {d.specialty || 'General'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Fees:</strong> ${d.fees}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Phone:</strong> {d.phoneNumber || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Location:</strong> {d.location || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Availability:</strong> {d.availability || 'N/A'}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ mt: 'auto', p: 2 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleBookClick(d)}
                          sx={{ borderRadius: 1 }}
                        >
                          Book Appointment
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>

            <Typography variant="h5" component="h2" sx={{ mt: 5, color: 'text.secondary' }}>Your Appointments</Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {appointments.length === 0 ? (
                <Typography sx={{ ml: 3, color: 'text.secondary' }}>No appointments found.</Typography>
              ) : (
                appointments.map((a) => (
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
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'primary.dark', mb: 1 }}>
                          Appointment with Dr. {a.doctor?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Date:</strong> {new Date(a.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
                      <CardActions sx={{ mt: 'auto', p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}> {/* Ensured flex and gap for horizontal alignment */}
                        {a.status === 'scheduled' && (
                          <>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleRescheduleClick(a)}
                              variant="outlined" // Added variant
                              sx={{ borderRadius: 1 }}
                            >
                              Reschedule
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleCancelClick(a._id)}
                              variant="outlined" // Added variant
                              sx={{ borderRadius: 1 }}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {a.status === 'pending' && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleCancelClick(a._id)}
                            variant="outlined" // Added variant
                            sx={{ borderRadius: 1 }}
                          >
                            Cancel
                          </Button>
                        )}
                      </CardActions>

                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </>
        )}

        {user?.role === 'doctor' && ( // Use optional chaining for user
          <>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.dark', mb: 3 }}>
              Doctor Dashboard
            </Typography>

            <Typography variant="h5" component="h2" sx={{ mt: 4, color: 'text.secondary' }}>Patient Appointment Requests (Pending)</Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {appointments.filter(a => a.status === 'pending').length === 0 ? (
                <Typography sx={{ ml: 3, color: 'text.secondary' }}>No pending appointment requests.</Typography>
              ) : (
                appointments.filter(a => a.status === 'pending').map((a) => (
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
                      <CardActions sx={{ mt: 'auto', p: 1, justifyContent: 'center', display: 'block', textAlign: 'center' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleAcceptClick(a._id)}
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
              {appointments.filter(a => a.status === 'scheduled').length === 0 ? (
                <Typography sx={{ ml: 3, color: 'text.secondary' }}>No scheduled appointments.</Typography>
              ) : (
                appointments.filter(a => a.status === 'scheduled').map((a) => (
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
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'primary.dark', mb: 1 }}>
                          Patient: {a.user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Date:</strong> {new Date(a.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
          </>
        )}

        {/* Reschedule Modal */}
        <Dialog open={!!rescheduleTarget} onClose={() => setRescheduleTarget(null)}>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              label="New Date"
              type="date"
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              value={rescheduleForm.date}
              onChange={e => { setRescheduleForm({ ...rescheduleForm, date: e.target.value }); setError(''); }}
            />
            <TextField
              label="New Time"
              type="time"
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              value={rescheduleForm.time}
              onChange={e => { setRescheduleForm({ ...rescheduleForm, time: e.target.value }); setError(''); }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRescheduleTarget(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleReschedule}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Cancel Dialog */}
        <Dialog
          open={confirmCancelOpen}
          onClose={() => setConfirmCancelOpen(false)}
        >
          <DialogTitle>Confirm Cancellation</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to cancel this appointment?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmCancelOpen(false)}>No</Button>
            <Button onClick={handleCancelConfirm} color="error" variant="contained">Yes, Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Doctor Acceptance Dialog */}
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
            <Button onClick={handleAcceptConfirm} color="primary" variant="contained">Yes, Accept</Button>
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