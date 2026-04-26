const Pass = require('../models/Pass.model');
const Visitor = require('../models/Visitor.model');
const CheckLog = require('../models/CheckLog.model');
const smsService = require('../services/sms.service');

// Scan Pass Code
exports.scanPass = async (req, res, next) => {
  try {
    console.log("Scanning pass code...");
    const passCode = req.body.passCode;

    // 1. Basic validation
    if (!passCode) {
      return res.status(400).json({ success: false, message: 'Pass code is required' });
    }

    // 2. Find the pass
    console.log("Looking up pass in DB:", passCode);
    const pass = await Pass.findOne({ passCode: passCode }).populate('appointment');
    
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Invalid Pass Code' });
    }

    // 3. Check pass status
    if (pass.status === 'Revoked' || pass.status === 'Expired') {
      return res.status(403).json({ success: false, message: `Pass is ${pass.status}` });
    }

    if (new Date() > pass.validUntil) {
      pass.status = 'Expired';
      await pass.save();
      return res.status(403).json({ success: false, message: 'Pass has expired' });
    }

    const visitorId = pass.appointment.visitor;

    // 4. Determine if checking in or checking out
    console.log("Checking for active log...");
    let activeLog = await CheckLog.findOne({ pass: pass._id, checkOutTime: { $exists: false } });

    if (!activeLog) {
      // THIS IS A CHECK-IN FLOW
      console.log("Starting check-in flow...");
      
      if (pass.status === 'Used') {
          return res.status(400).json({ success: false, message: 'Pass already exhausted' });
      }

      // Generate a simple 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save it to the visitor
      const visitor = await Visitor.findById(visitorId);
      visitor.otp = otp;
      visitor.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
      await visitor.save();

      console.log(`Generated OTP for ${visitor.phone} / ${visitor.name}`);

      // Wait to send the SMS
      await smsService.sendOTP(visitor.phone, otp);

      return res.status(200).json({
        success: true,
        action: 'OTP_REQUIRED',
        message: `OTP sent to ${visitor.phone}`,
        passCode: pass.passCode
      });

    } else {
      // THIS IS A CHECK-OUT FLOW
      console.log("Starting check-out flow...");
      
      // Update the log
      activeLog.checkOutTime = new Date();
      await activeLog.save();

      // Update visitor status
      await Visitor.findByIdAndUpdate(visitorId, { status: 'Checked-Out' });
      
      // Mark pass as used so they can't come back in with it
      pass.status = 'Used';
      await pass.save();

      console.log("Check-out complete.");
      return res.status(200).json({
        success: true,
        action: 'CHECK_OUT',
        message: 'Checked-Out successfully.',
        log: activeLog
      });
    }

  } catch (error) {
    console.log("Error in scanPass:", error);
    next(error);
  }
};

// Verify OTP
exports.verifyOtpAndCheckIn = async (req, res, next) => {
  try {
    console.log("Verifying OTP...");
    const passCode = req.body.passCode;
    const otp = req.body.otp;

    // 1. Validation
    if (!passCode || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide pass code and OTP' });
    }

    // 2. Find the pass again
    const pass = await Pass.findOne({ passCode: passCode }).populate('appointment');
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Invalid Pass Code' });
    }

    // 3. Find the visitor
    const visitorId = pass.appointment.visitor;
    const visitor = await Visitor.findById(visitorId);

    // 4. Check OTP match
    console.log(`Checking received OTP [${otp}]`);
    if (!visitor.otp || visitor.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // 5. Check if expired
    if (new Date() > visitor.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    console.log("OTP was valid. Performing check-in.");
    
    // 6. Clear OTP and check in
    visitor.otp = undefined;
    visitor.otpExpiry = undefined;
    visitor.status = 'Checked-In';
    await visitor.save();

    // 7. Create log
    const log = await CheckLog.create({
      pass: pass._id,
      visitor: visitorId,
      securityGuard: req.user.id,
      checkInTime: new Date()
    });

    res.status(200).json({
      success: true,
      action: 'CHECK_IN',
      message: 'Checked-In successfully.',
      log: log
    });

  } catch (error) {
    console.log("Error in verifyOtpAndCheckIn:", error);
    next(error);
  }
};

// Get check logs
exports.getLogs = async (req, res, next) => {
  try {
    console.log("Getting all check logs...");
    const logs = await CheckLog.find()
      .populate('visitor', 'name company')
      .populate('securityGuard', 'name')
      .sort({ checkInTime: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.log("Error in getLogs:", error);
    next(error);
  }
};
