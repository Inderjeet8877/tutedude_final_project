const Pass = require('../models/Pass.model');
const Visitor = require('../models/Visitor.model');
const CheckLog = require('../models/CheckLog.model');
const { sendOTP } = require('../services/sms.service');

// @desc    Scan a Pass Code and trigger Check-In or Check-Out
// @route   POST /api/checklogs/scan
// @access  Private (Security, Admin)
exports.scanPass = async (req, res, next) => {
  try {
    const { passCode } = req.body;

    if (!passCode) {
      return res.status(400).json({ success: false, message: 'Please provide a pass details' });
    }

    // 1. Validate Pass
    const pass = await Pass.findOne({ passCode }).populate('appointment');
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Invalid Pass Code' });
    }

    if (pass.status === 'Revoked' || pass.status === 'Expired') {
      return res.status(403).json({ success: false, message: `Pass is ${pass.status}` });
    }

    if (new Date() > pass.validUntil) {
      pass.status = 'Expired';
      await pass.save();
      return res.status(403).json({ success: false, message: 'Pass has expired limit thresholds' });
    }

    // Find the visitor attached to this appointment
    const visitorId = pass.appointment.visitor;

    // 2. Check if there is an active (open) check-log for this pass
    let activeLog = await CheckLog.findOne({ pass: pass._id, checkOutTime: { $exists: false } });

    if (!activeLog) {
      // PERFORM CHECK-IN
      if (pass.status === 'Used') {
          return res.status(400).json({ success: false, message: 'This pass has already been used and exhausted.' });
      }

      // Generate OTP and send instead of checking in immediately
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

      const visitor = await Visitor.findById(visitorId);
      visitor.otp = otp;
      visitor.otpExpiry = otpExpiry;
      await visitor.save();

      // Send SMS asynchronously
      sendOTP(visitor.phone, otp);

      return res.status(200).json({
        success: true,
        action: 'OTP_REQUIRED',
        message: `OTP sent to ${visitor.phone.substring(0, 2)}******${visitor.phone.substring(visitor.phone.length - 2)}`,
        passCode: pass.passCode // Send back passCode to help UI persist it
      });

    } else {
      // PERFORM CHECK-OUT
      activeLog.checkOutTime = new Date();
      await activeLog.save();

      // Update statuses
      await Visitor.findByIdAndUpdate(visitorId, { status: 'Checked-Out' });
      
      pass.status = 'Used'; // Mark single-use pass as exhausted
      await pass.save();

      return res.status(200).json({
        success: true,
        action: 'CHECK_OUT',
        message: 'Visitor successfully Checked-Out.',
        log: activeLog
      });
    }

  } catch (error) {
    next(error);
  }
};

// @desc    Get all check-logs
// @route   GET /api/checklogs
// @access  Private (Admin, Security)
exports.getLogs = async (req, res, next) => {
  try {
    const logs = await CheckLog.find()
      .populate('visitor', 'name company')
      .populate('securityGuard', 'name')
      .sort('-checkInTime');

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and Check-In
// @route   POST /api/checklogs/verify-otp
// @access  Private (Security, Admin)
exports.verifyOtpAndCheckIn = async (req, res, next) => {
  try {
    const { passCode, otp } = req.body;

    if (!passCode || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide pass code and OTP' });
    }

    const pass = await Pass.findOne({ passCode }).populate('appointment');
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Invalid Pass Code' });
    }

    const visitorId = pass.appointment.visitor;
    const visitor = await Visitor.findById(visitorId);

    if (!visitor.otp || visitor.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > visitor.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // OTP Valid. Perform Check In.
    // Clear OTP
    visitor.otp = undefined;
    visitor.otpExpiry = undefined;
    visitor.status = 'Checked-In';
    await visitor.save();

    const log = await CheckLog.create({
      pass: pass._id,
      visitor: visitorId,
      securityGuard: req.user.id,
      checkInTime: new Date()
    });

    return res.status(200).json({
      success: true,
      action: 'CHECK_IN',
      message: 'Visitor successfully Checked-In via OTP.',
      log
    });

  } catch (error) {
    next(error);
  }
};
