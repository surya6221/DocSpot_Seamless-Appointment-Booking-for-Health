const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth'); // Ensure isAdmin is imported

const {
  getAllUsers,
  getAllDoctors,
  updateDoctorStatus, // Used for approve/revoke
  deleteDoctor,       // New: For deleting a doctor
  getAllAppointmentsAdmin,
} = require('../controllers/adminController');

// Admin only routes - apply isAdmin middleware
router.use(auth, isAdmin); // All routes below this require auth and admin role

// GET all users (including customers, doctors, admins)
router.get('/users', getAllUsers);

// GET all doctors (pending and approved)
router.get('/doctors', getAllDoctors);

// PATCH: Update doctor approval status (approve/revoke)
// This will handle both "Approve" (approved: true) and "Revoke Approval" (approved: false)
router.patch('/doctors/:id/status', updateDoctorStatus);

// DELETE: Permanently delete a doctor
router.delete('/doctors/:id', deleteDoctor); // New: Route for deleting a doctor

// GET all appointments for admin view
router.get('/appointments', getAllAppointmentsAdmin);

module.exports = router;
