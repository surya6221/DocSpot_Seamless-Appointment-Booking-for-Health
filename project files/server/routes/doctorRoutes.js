const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getDoctors, getDoctorById } = require('../controllers/doctorController');

router.get('/', auth, getDoctors);
router.get('/:id', auth, getDoctorById);

module.exports = router;
