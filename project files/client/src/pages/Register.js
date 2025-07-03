import React, { useState, useEffect } from 'react';
import {
  Container, TextField, Button, Typography, Box, MenuItem, Alert, CircularProgress,
  IconButton, InputAdornment
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/slices/authSlice.js';
import { useNavigate, Navigate } from 'react-router-dom';

const roles = ['Customer', 'Doctor'];
const specialties = [
  'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist',
  'Orthopedic', 'Psychiatrist', 'ENT', 'General Physician', 'Oncologist'
];
const locations = [
  'Hyderabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'
];

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer', // Default role
    specialty: '',
    location: '',
    availability: '',
    fees: '',
    phoneNumber: ''
  });

  const [touched, setTouched] = useState({}); // New state to track touched fields
  const [formValid, setFormValid] = useState(false);
  const [error, setError] = useState(''); // General submission error
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  // Validation functions (can be moved outside if preferred)
  const isValidEmail = (email) => (/$^|.+@.+..+/).test(email);
  const isValidPhone = (phone) => /^\+91-\d{10}$/.test(phone);

  useEffect(() => {
    // Common fields validation
    const isNameValid = form.name.trim().length > 0;
    const isEmailValid = isValidEmail(form.email);
    const isPasswordValid = form.password.trim().length >= 6;

    let currentFormValid = isNameValid && isEmailValid && isPasswordValid;

    // Doctor specific fields validation
    if (form.role === 'doctor') {
      const isSpecialtyValid = form.specialty.trim().length > 0;
      const isLocationValid = form.location.trim().length > 0;
      const isAvailabilityValid = form.availability.trim().length > 0;
      const isFeesValid = form.fees > 0;
      const isPhoneNumberValid = isValidPhone(form.phoneNumber);

      currentFormValid = currentFormValid &&
        isSpecialtyValid &&
        isLocationValid &&
        isAvailabilityValid &&
        isFeesValid &&
        isPhoneNumberValid;
    }
    setFormValid(currentFormValid);
  }, [form]); // Re-run validation whenever form data changes

  // Redirect if already authenticated
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin/doctors" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      let input = value;
      if (!input.startsWith('+91-')) {
        input = '+91-';
      }
      let digits = input.replace('+91-', '').replace(/\D/g, '').slice(0, 10);
      setForm({ ...form, phoneNumber: `+91-${digits}` });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Mark all fields as touched on submission attempt to show all errors
    const allFields = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allFields);

    if (!formValid) {
      setError("Please fill in all required fields correctly.");
      setLoading(false);
      return;
    }

    try {
      await dispatch(registerUser(form)).unwrap();
      alert('Registered successfully! If you registered as a doctor, your account needs admin approval.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get error status for a field
  const getFieldError = (fieldName, validationCondition) => {
    return touched[fieldName] && !validationCondition;
  };

  // Helper function to get helper text for a field
  const getFieldHelperText = (fieldName, validationCondition, message) => {
    return getFieldError(fieldName, validationCondition) ? message : '';
  };


  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url("/images/register1-background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 30,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 2,
          zIndex: 0,
          overflowY: 'auto'
        }}
      >
        <Container
          maxWidth="xs"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 4,
            borderRadius: 2,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography variant="h5" align="center" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Register Your Account
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              label="Name"
              name="name"
              fullWidth
              margin="normal"
              required
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur} // Add onBlur
              variant="outlined"
              error={getFieldError('name', form.name.trim().length > 0)}
              helperText={getFieldHelperText('name', form.name.trim().length > 0, 'Name is required.')}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              required
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur} // Add onBlur
              variant="outlined"
              error={getFieldError('email', isValidEmail(form.email))}
              helperText={getFieldHelperText('email', isValidEmail(form.email), 'Please enter a valid email address.')}
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              required
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur} // Add onBlur
              variant="outlined"
              error={getFieldError('password', form.password.trim().length >= 6)}
              helperText={
                (touched.password && form.password.trim().length === 0)
                  ? 'Password is required.'
                  : (touched.password && form.password.trim().length > 0 && form.password.trim().length < 6)
                    ? `Password must be at least 6 characters. ${6 - form.password.trim().length} more needed.`
                    : ''
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(event) => event.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Role"
              name="role"
              fullWidth
              margin="normal"
              value={form.role}
              onChange={handleChange}
              onBlur={handleBlur} // Add onBlur (though role select usually has a default)
              variant="outlined"
            // Role will always have a value, so explicit error/helper is less critical
            >
              {roles.map((r) => (
                <MenuItem key={r} value={r.toLowerCase()}>{r}</MenuItem>
              ))}
            </TextField>

            {form.role === 'doctor' && (
              <>
                <TextField
                  select
                  label="Specialty"
                  name="specialty"
                  fullWidth
                  margin="normal"
                  required
                  value={form.specialty}
                  onChange={handleChange}
                  onBlur={handleBlur} // Add onBlur
                  variant="outlined"
                  error={getFieldError('specialty', form.specialty.trim().length > 0)}
                  helperText={getFieldHelperText('specialty', form.specialty.trim().length > 0, 'Specialty is required for doctors.')}
                >
                  {specialties.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Location"
                  name="location"
                  fullWidth
                  margin="normal"
                  required
                  value={form.location}
                  onChange={handleChange}
                  onBlur={handleBlur} // Add onBlur
                  variant="outlined"
                  error={getFieldError('location', form.location.trim().length > 0)}
                  helperText={getFieldHelperText('location', form.location.trim().length > 0, 'Location is required for doctors.')}
                >
                  {locations.map((loc) => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Availability"
                  name="availability"
                  fullWidth
                  margin="normal"
                  required
                  placeholder="e.g. Mon-Fri 9AM–5PM"
                  value={form.availability}
                  onChange={handleChange}
                  onBlur={handleBlur} // Add onBlur
                  multiline
                  rows={2}
                  variant="outlined"
                  error={getFieldError('availability', form.availability.trim().length > 0)}
                  helperText={getFieldHelperText('availability', form.availability.trim().length > 0, 'Availability is required for doctors.')}
                />
                <TextField
                  label="Fees"
                  name="fees"
                  type="number"
                  fullWidth
                  margin="normal"
                  required
                  value={form.fees}
                  onChange={handleChange}
                  onBlur={handleBlur} // Add onBlur
                  variant="outlined"
                  error={getFieldError('fees', form.fees > 0)}
                  helperText={getFieldHelperText('fees', form.fees > 0, 'Fees must be a positive number.')}
                />
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  fullWidth
                  margin="normal"
                  required
                  value={form.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur} // Add onBlur
                  placeholder="+91-XXXXXXXXXX"
                  variant="outlined"
                  error={getFieldError('phoneNumber', isValidPhone(form.phoneNumber))}
                  helperText={getFieldHelperText('phoneNumber', isValidPhone(form.phoneNumber), 'Phone number must be in +91-XXXXXXXXXX format.')}
                />
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 2, py: 1.5, borderRadius: 1, '&:hover': { opacity: 0.9 } }}
              disabled={!formValid || loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>

            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 2, cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate('/login')}
            >
              Have an account? Login here
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}