const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'doctor', 'admin'], default: 'customer' },
  // Doctor specific fields
  approved: { type: Boolean, default: false }, // Doctors need admin approval
  specialty: { type: String },
  location: { type: String },
  availability: { type: String }, // Ensure this is explicitly String
  fees: { type: Number },
  phoneNumber: { type: String },
});

module.exports = mongoose.model('User', userSchema);
