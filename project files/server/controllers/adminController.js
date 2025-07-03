const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Get all users (customers, doctors, admins)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude passwords
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users:", err.message);
    res.status(500).json({ error: 'Server Error fetching users' });
  }
};

// Get all doctors (pending and approved)
exports.getAllDoctors = async (req, res) => {
  try {
    // Fetch all doctors, regardless of approval status
    const doctors = await User.find({ role: 'doctor' }).select('-password -__v');
    res.json(doctors);
  } catch (err) {
    console.error("Error fetching all doctors (admin):", err.message);
    res.status(500).json({ error: 'Server Error fetching doctors' });
  }
};

// Update doctor's approval status (approve/revoke approval)
exports.updateDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // Expect boolean true/false

    const doctor = await User.findById(id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (doctor.role !== 'doctor') {
      return res.status(400).json({ error: 'User is not a doctor.' });
    }

    doctor.approved = approved;
    await doctor.save();
    res.json({ message: 'Doctor status updated successfully', doctor });
  } catch (err) {
    console.error("Error updating doctor status:", err.message);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server Error updating doctor status' });
  }
};

// NEW: Delete a doctor (permanent removal)
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await User.findById(id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (doctor.role !== 'doctor') {
      return res.status(400).json({ error: 'User is not a doctor.' });
    }

    // Optional: Also delete their associated appointments
    await Appointment.deleteMany({ doctor: id });

    await User.findByIdAndDelete(id);
    res.json({ message: 'Doctor deleted successfully.' });
  } catch (err) {
    console.error("Error deleting doctor:", err.message);
    res.status(500).json({ error: 'Server Error deleting doctor' });
  }
};

// Get all appointments for admin view
exports.getAllAppointmentsAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('user', 'name email')
      .populate('doctor', 'name email specialty');
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching all appointments (admin):", err.message);
    res.status(500).json({ error: 'Server Error fetching appointments' });
  }
};
