import React, { useState } from 'react';
import {
  Container, TextField, Button, Typography, Box, Alert, CircularProgress,
  IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice.js';
import { useNavigate, Navigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin/doctors" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const resultAction = await dispatch(loginUser(form)).unwrap();
      if (resultAction.user.role === 'admin') {
        navigate('/admin/doctors');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 70px)',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: 'url("/images/login-background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: 2,
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
        }}
      >
        <Typography variant="h5" align="center" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
          Welcome to DocSpot
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 3 }}>
          Login to Your Account
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            variant="outlined"
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 1,
              '&:hover': { opacity: 0.9 },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2, cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => navigate('/register')}
          >
            Don't have an account? Register here
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
