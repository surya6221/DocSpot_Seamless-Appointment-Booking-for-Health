import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux'; // Import Provider for Redux
import { store } from './redux/store.js'; // Import Redux store
import { createTheme, ThemeProvider, CssBaseline, Container, Typography } from '@mui/material'; // Import Material-UI theming components and other MUI components

import Navbar from './components/Navbar.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Dashboard from './pages/Dashboard.js';
// AdminPanel.js is likely the main layout for admin routes, keep its import
import AdminPanel from './pages/Admin/AdminPanel.js';
import AdminDoctors from './pages/Admin/AdminDoctors.js';
import AdminUsers from './pages/Admin/AdminUsers.js';
import BookAppointment from './pages/BookAppointment.js';
import DoctorDashboard from './pages/DoctorDashboard.js';
import DoctorsList from './pages/DoctorsList.js';
import Home from './pages/Home.js';
import { useSelector } from 'react-redux'; // Already imported, keeping for clarity


// Define a basic Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue
    },
    secondary: {
      main: '#dc004e', // Red
    },
    background: {
      default: '#f4f6f8', // Light grey for general background
      paper: '#ffffff', // White for cards, tables, etc.
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly more rounded buttons
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Rounded card corners
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Subtle shadow
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded text field borders
        },
      },
    },
    // You can add more component overrides here for global styling
  },
});


// A simple Higher-Order Component for protected routes
const RequireAuth = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }

  // If specific roles are required, check if the user's role matches
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect based on the user's role if they don't have access to this specific route
    if (user?.role === 'admin') return <Navigate to="/admin/doctors" replace />;
    if (user?.role === 'customer') return <Navigate to="/dashboard" replace />;
    if (user?.role === 'doctor') return <Navigate to="/doctor" replace />;
    return <Navigate to="/login" replace />; // Fallback if authenticated but role doesn't match any known protected path
  }

  return children;
};

export default function App() {
  return (
    <Provider store={store}> {/* Redux Provider */}
      <ThemeProvider theme={theme}> {/* Material-UI ThemeProvider */}
        <CssBaseline /> {/* Applies basic CSS to normalize styles and provide a consistent baseline */}
        <Router>
          <Navbar />
          {/* Removed Container around Routes to allow Home component to be full-width and consistent theming */}
          <Routes>
            {/* Public Home Route - Accessible to everyone, no authentication required */}
            <Route path="/" element={<Home />} />

            {/* Authentication Routes - Login/Register pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Doctors List - Accessible from Home, no authentication required for viewing */}
            {/* Wrap DoctorsList in Container if you want it to have default spacing */}
            <Route path="/doctors-list" element={<Container sx={{ mt: 4 }}><DoctorsList /></Container>} />

            {/* Customer & Doctor Dashboard - Protected routes */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth allowedRoles={['customer', 'doctor']}>
                  {/* Keep Container for Dashboard if you want its specific spacing */}
                  <Container sx={{ mt: 4 }}><Dashboard /></Container>
                </RequireAuth>
              }
            />
            {/* Book Appointment - Protected for customers */}
            <Route
              path="/book-appointment/:docId"
              element={
                <RequireAuth allowedRoles={['customer']}>
                  {/* Keep Container for BookAppointment if you want its specific spacing */}
                  <Container sx={{ mt: 4 }}><BookAppointment /></Container>
                </RequireAuth>
              }
            />

            {/* Doctor's Specific Dashboard - Protected for doctors */}
            <Route
              path="/doctor"
              element={
                <RequireAuth allowedRoles={['doctor']}>
                  {/* Keep Container for DoctorDashboard if you want its specific spacing */}
                  <Container sx={{ mt: 4 }}><DoctorDashboard /></Container>
                </RequireAuth>
              }
            />

            {/* Admin Routes - Nested routes within AdminPanel, protected for admins */}
            <Route
              path="/admin"
              element={
                <RequireAuth allowedRoles={['admin']}>
                  <AdminPanel /> {/* AdminPanel itself handles its own Container/layout */}
                </RequireAuth>
              }
            >
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="users" element={<AdminUsers />} />
              {/* Default admin route: Redirect to doctors list if just /admin is accessed */}
              <Route index element={<Navigate to="doctors" replace />} />
            </Route>

            {/* Fallback for unmatched routes - Rendered inside a Container for consistent styling */}
            <Route path="*" element={<Container sx={{ mt: 4 }}><Typography variant="h4">404 - Page Not Found</Typography></Container>} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

