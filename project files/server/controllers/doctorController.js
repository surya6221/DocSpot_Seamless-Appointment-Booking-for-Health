const User = require('../models/User');

// Get all approved doctors
exports.getDoctors = async (req, res) => {
  try {
    // Select all fields except password and __v (version key)
    // This explicitly includes 'availability', 'fees', 'phoneNumber', 'location', 'specialty'
    const doctors = await User.find({ role: 'doctor', approved: true }).select('-password -__v');
    res.json(doctors);
  } catch (err) {
    console.error("Error fetching all doctors:", err.message);
    res.status(500).send('Server Error');
  }
};

// Get a single doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    // Select all fields except password and __v (version key)
    // This explicitly includes 'availability', 'fees', 'phoneNumber', 'location', 'specialty'
    const doctor = await User.findById(req.params.id).select('-password -__v');
    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (err) {
    console.error("Error fetching doctor by ID:", err.message);
    // Check if the error is due to an invalid ID format
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Doctor not found' });
    }
    res.status(500).send('Server Error');
  }
};
