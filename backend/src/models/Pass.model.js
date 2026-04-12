const mongoose = require('mongoose');

const passSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Pass must be linked to an appointment'],
      unique: true, // 1 pass per appointment
    },
    passCode: {
      type: String,
      required: true,
      unique: true, // Secure alphanumeric random id
    },
    qrCodeUrl: {
      type: String, // Storing base64 image or a cloud storage link
      required: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Valid', 'Used', 'Expired', 'Revoked'],
      default: 'Valid',
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to detect expiry on retrieval could be added here
module.exports = mongoose.model('Pass', passSchema);
