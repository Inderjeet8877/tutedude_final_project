const Appointment = require('../models/Appointment.model');

// @desc    Get all appointments (Filter by role)
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    let query = {};

    // If user is Employee, only show their appointments
    if (req.user.role === 'Employee') {
      query.employee = req.user.id;
    }

    // Admins and Security can see all, maybe filtered by status/date
    if (req.query.status) query.status = req.query.status;
    
    // Sort logic pending -> upcoming -> past
    const appointments = await Appointment.find(query)
      .populate('visitor', 'name email phone company')
      .populate('employee', 'name email')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor')
      .populate('employee', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role check: Employee can only see their own
    if (req.user.role === 'Employee' && appointment.employee._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this appointment' });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Admin, Employee)
exports.createAppointment = async (req, res, next) => {
  try {
    // If the frontend didn't supply an employee ID (e.g. Admin requests it directly), default to themselves
    if (!req.body.employee) {
      req.body.employee = req.user.id;
    }

    const appointment = await Appointment.create(req.body);

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Approve/Reject)
// @route   PUT /api/appointments/:id
// @access  Private (Admin, Employee)
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Ensure Employee can only update their own
    if (req.user.role === 'Employee' && appointment.employee.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin only)
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
