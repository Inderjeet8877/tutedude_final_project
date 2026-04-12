const mongoose = require('mongoose');

const checkLogSchema = new mongoose.Schema(
  {
    pass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pass',
      required: true,
    },
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      required: true,
    },
    securityGuard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkInTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// We want to ensure one open check-log per pass
module.exports = mongoose.model('CheckLog', checkLogSchema);
