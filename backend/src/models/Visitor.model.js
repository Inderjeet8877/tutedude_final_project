const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the visitor name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide the visitor email'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide the visitor phone number'],
    },
    company: {
      type: String,
      default: 'N/A',
    },
    address: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Expected', 'Checked-In', 'Checked-Out', 'Cancelled'],
      default: 'Expected',
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Visitor', visitorSchema);
