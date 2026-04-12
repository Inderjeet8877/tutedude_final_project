const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply protect middleware to all routes below
router.use(protect);

router
  .route('/')
  .get(getAppointments)
  .post(authorize('Admin', 'Employee'), createAppointment);

router
  .route('/:id')
  .get(getAppointment)
  .put(authorize('Admin', 'Employee', 'Security'), updateAppointment)
  .delete(authorize('Admin'), deleteAppointment);

module.exports = router;
