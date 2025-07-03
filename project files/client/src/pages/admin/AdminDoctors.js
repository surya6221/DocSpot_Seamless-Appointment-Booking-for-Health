import React, { useEffect, useState } from 'react';
import {
  Typography, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Snackbar, Alert, Chip, CardMedia, // Added Box, Snackbar, Alert, Chip, CardMedia
  CardActions
} from '@mui/material';
import api from '../../services/api.js'; // Ensure path is correct

// Array of placeholder doctor images (ensure these exist in public/images/)
const doctorImages = [
  '/images/doctor1.png',
  '/images/doctor2.png',
  '/images/doctor3.png',
  '/images/doctor4.png',
  '/images/doctor5.png',
];

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve', 'delete', 'revoke'
  // Removed local error state as Snackbar will handle all feedback now

  // Snackbar state for user feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'

  // Fetch all doctors from the backend
  const fetchDoctors = React.useCallback(async () => {
    try {
      const res = await api.get('/admin/doctors'); // This now fetches all doctors
      setDoctors(res.data);
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Failed to fetch doctors.', 'error'); // Use Snackbar for error
      console.error("Error fetching doctors:", err);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

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

  const handleActionClick = (doc, action) => {
    setSelectedDoctor(doc);
    setActionType(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedDoctor) return;

    try {
      if (actionType === 'approve') {
        await api.patch(`/admin/doctors/${selectedDoctor._id}/status`, { approved: true });
        showSnackbar('Doctor approved successfully!', 'success');
      } else if (actionType === 'revoke') {
        await api.patch(`/admin/doctors/${selectedDoctor._id}/status`, { approved: false });
        showSnackbar('Doctor approval revoked successfully!', 'success');
      } else if (actionType === 'delete') {
        await api.delete(`/admin/doctors/${selectedDoctor._id}`);
        showSnackbar('Doctor deleted successfully!', 'success');
      }
      setConfirmDialogOpen(false);
      setSelectedDoctor(null);
      setActionType('');
      fetchDoctors(); // Re-fetch list to update UI
    } catch (err) {
      showSnackbar(err.response?.data?.error || `Failed to ${actionType} doctor.`, 'error');
      console.error(`Error performing ${actionType} action:`, err);
    }
  };

  // Helper to get status color for Chip
  const getStatusColor = (approved) => {
    return approved ? 'success' : 'warning';
  };

  return (
    // AdminDoctors will be rendered as a child of AdminPanel,
    // so it doesn't need its own background Box or top-level container styling.
    // It will inherit the background and spacing from AdminPanel.
    <Box sx={{ flexGrow: 1 }}> {/* FlexGrow ensures it takes available space */}
      <Typography variant="h5" gutterBottom sx={{ color: 'text.secondary', mb: 3 }}>
        Manage Doctors
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {doctors.length === 0 ? (
          <Typography sx={{ ml: 3, color: 'text.secondary' }}>No doctors found.</Typography>
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
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h6" component="div" sx={{ mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
                    Dr. {d.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> {d.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Specialty:</strong> {d.specialty || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Location:</strong> {d.location || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Availability:</strong> {d.availability || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Fees:</strong> ${d.fees || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Phone:</strong> {d.phoneNumber || 'N/A'}
                  </Typography>
                  {/* Status Chip: Ensure it's on its own line and centered if possible */}
                  <Box sx={{ mt: 1, mb: 1, display: 'flex', justifyContent: 'center' }}>
                    <Chip
                      label={`Status: ${d.approved ? 'Approved' : 'Pending Approval'}`}
                      color={getStatusColor(d.approved)}
                      size="medium"
                      sx={{ textTransform: 'capitalize', fontWeight: 'bold', borderRadius: '8px' }}
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{
                  mt: 'auto', // Push to bottom
                  p: 2, // General padding
                  pt: 1.5, // Slightly more padding top
                  justifyContent: 'center', // Center buttons horizontally
                  flexWrap: 'wrap', // Allow buttons to wrap to next line
                  gap: 1 // Space between buttons when they wrap or are on the same line
                }}>
                  {!d.approved && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleActionClick(d, 'approve')}
                      sx={{ borderRadius: 1 }}
                    >
                      Approve
                    </Button>
                  )}
                  {d.approved && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      onClick={() => handleActionClick(d, 'revoke')}
                      sx={{ borderRadius: 1 }}
                    >
                      Revoke Approval
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleActionClick(d, 'delete')}
                    sx={{ borderRadius: 1 }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Doctor' :
            actionType === 'revoke' ? 'Revoke Doctor Approval' :
              'Delete Doctor'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionType === 'approve' ? 'approve' :
              actionType === 'revoke' ? 'revoke approval for' :
                'permanently delete'} Dr. <strong>{selectedDoctor?.name}</strong>?
            {actionType === 'delete' && <span style={{ color: 'red' }}> This action cannot be undone.</span>}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            color={actionType === 'approve' ? 'primary' : 'error'}
            variant="contained"
          >
            {actionType === 'approve' ? 'Approve' :
              actionType === 'revoke' ? 'Confirm Revoke' :
                'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for general messages */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}