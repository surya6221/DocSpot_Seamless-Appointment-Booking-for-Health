const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createAppointment,
  getCustomerAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  getBookedSlotsForDoctor // Added this
} = require('../controllers/appointmentController');

// Get all appointments for the logged-in customer
router.get('/', auth, getCustomerAppointments);

// Get all appointments for the logged-in doctor
router.get('/doctor', auth, getDoctorAppointments);

// Get booked slots for a specific doctor (for booking validation)
router.get('/doctor/:doctorId/booked-slots', auth, getBookedSlotsForDoctor); // New Route

// Create a new appointment (customer) - multer middleware `upload.single('document')` is already applied in server.js
router.post('/', auth, createAppointment);

// Update status (e.g., approve) - for doctor or admin
router.patch('/:id', auth, updateAppointmentStatus);

// Reschedule (or modify) an appointment
router.put('/:id', auth, updateAppointment);

// Cancel (delete) an appointment
router.delete('/:id', auth, deleteAppointment);

module.exports = router;