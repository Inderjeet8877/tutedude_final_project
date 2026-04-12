const crypto = require('crypto');
const Pass = require('../models/Pass.model');
const Appointment = require('../models/Appointment.model');
const Visitor = require('../models/Visitor.model');
const qrService = require('../services/qr.service');
const pdfService = require('../services/pdf.service');
const emailService = require('../services/email.service');

// @desc    Issue a pass for an approved appointment
// @route   POST /api/passes/issue/:appointmentId
// @access  Private (Admin, Employee)
exports.issuePass = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('visitor')
      .populate('employee', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Cannot issue pass for an unapproved appointment' });
    }

    // Check if pass already exists
    let pass = await Pass.findOne({ appointment: appointment._id });
    if (pass) {
      return res.status(400).json({ success: false, message: 'Pass already issued for this appointment' });
    }

    // Generate random secure hex token for the pass validation
    const passCode = crypto.randomBytes(6).toString('hex').toUpperCase();

    // The QR code contains the full base URL or simply the code
    const validationUrl = `http://localhost:5173/security/verify/${passCode}`;
    const qrCodeUrl = await qrService.generateQRCode(validationUrl);

    // Create the Pass in DB
    // Valid from current time until end of the day or specifically 24hrs 
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setHours(23, 59, 59, 999);

    pass = await Pass.create({
      appointment: appointment._id,
      passCode,
      qrCodeUrl,
      validFrom,
      validUntil,
    });

    res.status(201).json({
      success: true,
      message: 'Pass dynamically generated safely',
      data: pass,
    });

    // We dispatch email sending into the background instead of waiting synchronously
    sendPassEmail(appointment, passCode, qrCodeUrl).catch(err => {
      console.error('Failed to dispatch background email:', err.message);
    });

  } catch (error) {
    next(error);
  }
};

// Internal Background logic for gathering pass buffer
const sendPassEmail = async (appointment, passCode, qrCodeUrl) => {
    // We compose the PDF payload with the relations
    const passData = { 
        visitor: appointment.visitor, 
        employee: appointment.employee, 
        date: appointment.date, 
        time: appointment.time, 
        passCode,
        qrCodeUrl
    };

    const pdfBuffer = await pdfService.generatePDFPass(passData);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #4F46E5;">Hello ${appointment.visitor.name},</h2>
        <p>Your appointment with <strong>${appointment.employee.name}</strong> has been <strong>approved</strong>!</p>
        <p>Attached is your formal <b>Digital Visitor Pass</b>. Open the PDF to view your Pass Code and QR Code.</p>
        <div style="background-color: #F3F4F6; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0;">
          <strong>Track Your Status Online:</strong>
          <p style="margin: 5px 0 0 0;">You can view your active passes and appointment statuses at any time by logging into our Visitor Portal.</p>
          <ul style="margin: 5px 0 0 0; padding-left: 20px;">
            <li><strong>Portal URL:</strong> <a href="http://localhost:5173/login" style="color: #4F46E5;">http://localhost:5173/login</a></li>
            <li><strong>Login Email:</strong> ${appointment.visitor.email}</li>
            <li><strong>Password:</strong> password123</li>
          </ul>
        </div>
        <p>Please present the attachment or login to your portal at the front desk when arriving.</p>
        <br />
        <p>Regards,<br/><strong>The Administrative Team</strong></p>
      </div>
    `;

    await emailService.sendEmail({
        email: appointment.visitor.email,
        subject: `[ACTION REQUIRED] Your Visitor Pass - ${appointment.employee.name}`,
        message: 'Your Pass has been approved. Please view the attached PDF for access.',
        html: emailHtml,
        attachments: [
            {
               filename: `Visitor_Pass_${passCode}.pdf`,
               content: pdfBuffer,
               contentType: 'application/pdf'
            }
        ]
    });
};

// @desc    Get Pass details by validating passcode (Scanned)
// @route   GET /api/passes/verify/:passCode
// @access  Private (Security, Admin)
exports.verifyPass = async (req, res, next) => {
  try {
    const pass = await Pass.findOne({ passCode: req.params.passCode })
      .populate({
         path: 'appointment',
         populate: { path: 'visitor employee' }
      });

    if (!pass) {
      return res.status(404).json({ success: false, message: 'Invalid Pass Code' });
    }

    // Auto update status if expired
    if (new Date() > pass.validUntil && pass.status === 'Valid') {
        pass.status = 'Expired';
        await pass.save();
    }

    res.status(200).json({
      success: true,
      data: pass,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all passes for a logged-in visitor
// @route   GET /api/passes/my-passes
// @access  Private (Visitor)
exports.getVisitorPasses = async (req, res, next) => {
  try {
    const email = req.user.email;
    
    const visitor = await Visitor.findOne({ email: new RegExp('^' + email + '$', 'i') });
    if (!visitor) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const passes = await Pass.find()
      .populate({
        path: 'appointment',
        match: { visitor: visitor._id },
        populate: { path: 'employee', select: 'name email phone' }
      })
      .sort('-createdAt');

    const filteredPasses = passes.filter(pass => pass.appointment !== null);

    res.status(200).json({
      success: true,
      count: filteredPasses.length,
      data: filteredPasses,
    });
  } catch (error) {
    next(error);
  }
};
