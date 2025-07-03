import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Avatar,
  Menu, MenuItem, Box, IconButton
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/login');
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 600 }}
          onClick={() => navigate('/')}
        >
          DocSpot
        </Typography>

        {isAuthenticated && user ? (
          <Box display="flex" alignItems="center">
            {user.role === 'customer' && (
              <Button color="inherit" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            )}
            {user.role === 'doctor' && (
              <Button color="inherit" onClick={() => navigate('/doctor')}>My Appointments</Button>
            )}
            {user.role === 'admin' && (
              <Button color="inherit" onClick={() => navigate('/admin')}>Admin Panel</Button>
            )}
            <IconButton onClick={handleAvatarClick} sx={{ ml: 2 }}>
              <Avatar sx={{ bgcolor: '#ffffff', color: '#1976d2', fontWeight: 'bold' }}>
                {getInitial(user.name)}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
            <Button color="inherit" onClick={() => navigate('/register')}>Register</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
