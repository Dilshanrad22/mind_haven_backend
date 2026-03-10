const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const { protect, authorizeUser } = require('../middleware/auth');

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private (users only)
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, sessionType, issue, message } = req.body;

    if (!doctorId || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, date, and startTime',
      });
    }

    const doctor = await Doctor.findById(doctorId).populate('userId', 'name');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      doctorId,
      date: new Date(date),
      startTime,
      endTime,
      sessionType: sessionType || 'video',
      issue,
      message,
    });

    // Create notification for doctor
    await Notification.create({
      userId: doctor.userId._id,
      title: 'New Appointment Request',
      message: `${req.user.name} has requested a ${sessionType || 'video'} session on ${new Date(date).toLocaleDateString()}.`,
      type: 'appointment',
      relatedId: appointment._id,
    });

    res.status(201).json({
      success: true,
      message: 'Appointment request created successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   GET /api/appointments
// @desc    Get user's appointments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    // If doctor, find their doctor profile and get appointments
    if (req.user.userType === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor) {
        query.doctorId = doctor._id;
      }
    } else {
      query.userId = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctorId',
        select: 'specialization rating experience',
        populate: { path: 'userId', select: 'name email profileImage' },
      })
      .populate('userId', 'name email profileImage')
      .sort({ date: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctorId',
        select: 'specialization rating experience',
        populate: { path: 'userId', select: 'name email profileImage' },
      })
      .populate('userId', 'name email profileImage');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, cancelReason, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status',
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' },
      })
      .populate('userId', 'name');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    appointment.status = status;
    if (cancelReason) appointment.cancelReason = cancelReason;
    if (notes) appointment.notes = notes;

    await appointment.save();

    // Notify the other party
    const notifyUserId =
      req.user.userType === 'doctor' ? appointment.userId._id : appointment.doctorId.userId._id;

    const statusMessages = {
      confirmed: `Your appointment has been confirmed.`,
      completed: `Your appointment has been marked as completed.`,
      cancelled: `Your appointment has been cancelled.${cancelReason ? ' Reason: ' + cancelReason : ''}`,
    };

    if (statusMessages[status]) {
      await Notification.create({
        userId: notifyUserId,
        title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: statusMessages[status],
        type: 'appointment',
        relatedId: appointment._id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: appointment,
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Reschedule appointment
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (date) appointment.date = new Date(date);
    if (startTime) appointment.startTime = startTime;
    if (endTime) appointment.endTime = endTime;
    appointment.status = 'rescheduled';

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelReason = req.body.cancelReason || 'Cancelled by user';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
