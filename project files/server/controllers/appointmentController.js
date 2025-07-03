const Appointment = require('../models/Appointment');
const User = require('../models/User');

// GET /api/appointments (for customers)
exports.getCustomerAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .populate('doctor', 'name email specialty')
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/appointments/doctor (for doctors)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate('user', 'name email')
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/appointments/doctor/:id/booked-slots (New: Get booked slots for a specific doctor)
exports.getBookedSlotsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      status: { $in: ['pending', 'scheduled'] } // Consider pending and scheduled as booked
    }).select('date time');
    res.json(bookedAppointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Create a new appointment (customer)
exports.createAppointment = async (req, res) => {
  const { doctorId, date, time } = req.body;
  const documentPath = req.file ? `/uploads/${req.file.filename}` : undefined; // Get document path

  try {
    // Check if the slot is already booked for this doctor
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $in: ['pending', 'scheduled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ msg: 'This time slot is already booked for this doctor.' });
    }

    const newAppointment = new Appointment({
      user: req.user.id,
      doctor: doctorId,
      date,
      time,
      documentUrl: documentPath, // Save the document URL
    });

    const appointment = await newAppointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update status (e.g., approve) - for doctor or admin
exports.updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Basic authorization: Only the doctor or admin related to the appointment can update status
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Not authorized to update this appointment.' });
    }
    if (req.user.role === 'customer') { // Customers can only cancel their own appointments
      if (status === 'cancelled' && appointment.user.toString() === req.user.id) {
         appointment.status = status;
      } else {
        return res.status(403).json({ msg: 'Customers can only cancel their own appointments.' });
      }
    } else if (['pending', 'scheduled', 'completed', 'cancelled'].includes(status)) {
      appointment.status = status;
    } else {
      return res.status(400).json({ msg: 'Invalid status provided.' });
    }

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Reschedule (or modify) an appointment
exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body; // Can extend with other fields

  try {
    let appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Ensure only the user who booked or admin can reschedule
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to reschedule this appointment' });
    }

    // Check if the new slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      date,
      time,
      _id: { $ne: id }, // Exclude current appointment
      status: { $in: ['pending', 'scheduled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ msg: 'The new time slot is already booked for this doctor.' });
    }

    appointment.date = date || appointment.date;
    appointment.time = time || appointment.time;
    appointment.status = 'pending'; // Set to pending for doctor re-confirmation

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Cancel (delete) an appointment
exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Allow user who booked or admin to cancel
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to cancel this appointment' });
    }

    await Appointment.findByIdAndDelete(id);
    res.json({ msg: 'Appointment cancelled successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Admin: Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('user', 'name email')
      .populate('doctor', 'name email specialty');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};