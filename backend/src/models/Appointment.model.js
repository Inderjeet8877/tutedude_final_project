const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      required: [true, 'Please provide a visitor ID'],
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an employee ID to visit'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide an appointment date'],
    },
    time: {
      type: String,
      required: [true, 'Please provide an appointment time'],
    },
    purpose: {
      type: String,
      required: [true, 'Please state the purpose of visit'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
      default: 'Pending',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
