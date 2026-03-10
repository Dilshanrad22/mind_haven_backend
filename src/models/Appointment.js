const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
    },
    sessionType: {
      type: String,
      enum: ['video', 'chat', 'in-person'],
      default: 'video',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'pending',
    },
    issue: {
      type: String,
      maxlength: 1000,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    cancelReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ userId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
