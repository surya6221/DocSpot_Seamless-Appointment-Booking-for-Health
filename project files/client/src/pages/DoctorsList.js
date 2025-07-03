import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CardActions // <--- Add CardActions here
} from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';


export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null); // Renamed from 'selected' for clarity
  const [form, setForm] = useState({ date: '', time: '' });
  const [error, setError] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/doctors').then(res => setDoctors(res.data));
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      api.get(`/appointments/doctor/${selectedDoctor._id}/booked-slots`)
        .then(res => {
          setBookedSlots(res.data.map(slot => ({ date: slot.date, time: slot.time })));
        })
        .catch(err => console.error("Error fetching booked slots for selected doctor:", err));
    }
  }, [selectedDoctor]);

  const isSlotBooked = (date, time) => {
    return bookedSlots.some(slot => slot.date === date && slot.time === time);
  };

  const handleBookClick = doc => {
    setSelectedDoctor(doc);
    setForm({ date: '', time: '' }); // Reset form when a new doctor is selected
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    if (isSlotBooked(form.date, form.time)) {
      setError('This date and time is already booked. Please choose another slot.');
      return;
    }

    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        date: form.date,
        time: form.time,
      });
      setSelectedDoctor(null);
      navigate('/dashboard'); // Navigate to dashboard after booking
    } catch (err) {
      setError(err.response?.data?.msg || 'Booking failed');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Available Doctors</Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {doctors.map((d) => (
          <Grid item xs={12} sm={6} md={4} key={d._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{d.name}</Typography>
                <Typography>{d.specialty || 'General'}</Typography>
                <Typography>Fees: ${d.fees}</Typography> {/* Display fees */}
                <Typography>Availability: {d.availability}</Typography>
              </CardContent>
              <CardActions> {/* This is where CardActions is used */}
                <Button size="small" onClick={() => handleBookClick(d)}>Book Now</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!selectedDoctor} onClose={() => setSelectedDoctor(null)}>
        <DialogTitle>Book with Dr. {selectedDoctor?.name}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Date" type="date" fullWidth margin="dense"
            InputLabelProps={{ shrink: true }}
            onChange={(e) => { setForm({ ...form, date: e.target.value }); setError(''); }}
            value={form.date}
          />
          <TextField
            label="Time" type="time" fullWidth margin="dense"
            InputLabelProps={{ shrink: true }}
            onChange={(e) => { setForm({ ...form, time: e.target.value }); setError(''); }}
            value={form.time}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDoctor(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}