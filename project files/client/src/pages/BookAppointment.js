import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, TextField,
  Alert, CircularProgress, Snackbar, // Added Snackbar
  Card, CardContent, // Added Card and CardContent for the main info card
  // Removed CardMedia, Chip as they might not be directly relevant for the single doctor profile here
} from '@mui/material';
import api from '../services/api.js'; // Ensure path is correct
import { useParams, useNavigate } from 'react-router-dom';

export default function BookAppointment() {
  const { docId } = useParams();
  const [doctor, setDoctor] = useState({});
  const [form, setForm] = useState({ date: '', time: '' });
  const [file, setFile] = useState(null); // State to store the selected file
  const [fileName, setFileName] = useState(''); // State to display the selected file name
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(''); // State for error messages (for local form validation)

  // Snackbar states for general success/error messages
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'

  const navigate = useNavigate();

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

  // Fetch doctor details when component mounts or docId changes
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${docId}`);
        setDoctor(res.data);
      } catch (err) {
        showSnackbar(err.response?.data?.msg || 'Failed to fetch doctor details.', 'error');
        console.error("Error fetching doctor:", err);
      }
    };
    fetchDoctor();
  }, [docId]);

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(''); // Clear any previous file-related errors
    } else {
      setFile(null);
      setFileName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous local form errors
    setLoading(true);

    // Basic validation
    if (!form.date || !form.time) {
      setError('Please select both date and time for the appointment.');
      setLoading(false);
      return;
    }

    const data = new FormData(); // FormData is required for file uploads
    data.append('doctorId', docId);
    data.append('date', form.date);
    data.append('time', form.time);
    if (file) {
      data.append('document', file); // Append the file if selected
    }

    try {
      await api.post('/appointments', data, {
        headers: { 'Content-Type': 'multipart/form-data' } // Important for FormData
      });
      showSnackbar('Appointment requested successfully! Redirecting to dashboard...', 'success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      showSnackbar(err.response?.data?.msg || err.response?.data?.error?.details || 'Appointment request failed. Please try again.', 'error');
      console.error("Appointment submission error:", err);
    } finally {
      setLoading(false);
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
        backgroundImage: 'url("/images/book-appointment.jpeg")', // Make sure this image exists
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        zIndex: -1,
        overflow: 'auto', // Allows content to scroll over the fixed background
      }}
    >
      <Container maxWidth="sm" sx={{ // Changed to sm for a slightly narrower card
        pt: { xs: 8, sm: 10, p: 0 }, // Increased padding-top for better spacing from the top bar
        pb: 4, // Padding bottom
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)', // Adjust based on header height if any
      }}>
        <Card
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly transparent white background for content
            borderRadius: 2,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            p: 0, // Padding inside the card
            width: '100%', // Ensure card takes full width of its container
            maxWidth: '500px', // Optional: Cap max width for card
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ color: 'primary.dark', mb: 2 }}>
              Book Appointment with
            </Typography>
            <Typography variant="h4" component="h2" sx={{ color: 'secondary.main', mb: 1, fontWeight: 'bold' }}>
              Dr. {doctor.name || 'Loading...'}
            </Typography>

            {/* Doctor Details Section */}
            {doctor.name && ( // Only show details if doctor data is loaded
              <Box sx={{ width: '100%', mb: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  <strong>Specialty:</strong> {doctor.specialty || 'General'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Fees:</strong> ${doctor.fees || 'N/A'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Location:</strong> {doctor.location || 'N/A'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Availability:</strong> {doctor.availability || 'N/A'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Contact:</strong> {doctor.phoneNumber || 'N/A'}
                </Typography>
              </Box>
            )}

            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            {/* Success messages are now handled by Snackbar */}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                type="date"
                label="Appointment Date"
                InputLabelProps={{ shrink: true }}
                onChange={e => setForm({ ...form, date: e.target.value })}
                value={form.date}
                required
                fullWidth
                variant="outlined"
              />
              <TextField
                type="time"
                label="Appointment Time"
                InputLabelProps={{ shrink: true }}
                onChange={e => setForm({ ...form, time: e.target.value })}
                value={form.time}
                required
                fullWidth
                variant="outlined"
              />
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ py: 1.5, borderRadius: 1 }}
              >
                Upload Document (Optional)
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" // Added .jpeg
                />
              </Button>
              {fileName && (
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
                  Selected file: <strong>{fileName}</strong>
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
                size="large"
                sx={{ mt: 2, py: 1.5, borderRadius: 1, '&:hover': { opacity: 0.9 } }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Request Appointment'}
              </Button>
            </Box>
          </CardContent>
        </Card>
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