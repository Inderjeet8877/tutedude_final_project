const Visitor = require('../models/Visitor.model');
const Appointment = require('../models/Appointment.model');
const CheckLog = require('../models/CheckLog.model');

// @desc    Get dashboard statistics for Admin
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Run queries in parallel for efficiency
    const [
      totalVisitors,
      activeVisitors,
      todayAppointments,
      pendingAppointments,
      recentLogs
    ] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.countDocuments({ status: 'Checked-In' }),
      Appointment.countDocuments({ date: { $gte: today } }),
      Appointment.countDocuments({ status: 'Pending' }),
      CheckLog.find()
        .populate('visitor', 'name company')
        .populate('securityGuard', 'name')
        .sort('-checkInTime')
        .limit(10) // Get the latest 10 logs for activity feed
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalVisitors,
        activeVisitors,
        todayAppointments,
        pendingAppointments,
        recentLogs
      }
    });

  } catch (error) {
    next(error);
  }
};
