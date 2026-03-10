const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Doctor = require('../models/Doctor');
const { protect, authorizeUser } = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Create a review for a doctor
// @access  Private (users only)
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;

    if (!doctorId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId and rating',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if user had a completed appointment with this doctor
    if (appointmentId) {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        userId: req.user._id,
        doctorId,
        status: 'completed',
      });

      if (!appointment) {
        return res.status(400).json({
          success: false,
          message: 'You can only review after a completed appointment',
        });
      }

      // Check for duplicate review on same appointment
      const existingReview = await Review.findOne({ appointmentId });
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this appointment',
        });
      }
    }

    const review = await Review.create({
      userId: req.user._id,
      doctorId,
      appointmentId,
      rating,
      comment,
    });

    // Notify doctor
    const doctor = await Doctor.findById(doctorId).populate('userId', '_id');
    if (doctor) {
      await Notification.create({
        userId: doctor.userId._id,
        title: 'New Review',
        message: `${req.user.name} left a ${rating}-star review.`,
        type: 'review',
        relatedId: review._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   GET /api/reviews/doctor/:doctorId
// @desc    Get reviews for a doctor
// @access  Public
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Review.countDocuments({ doctorId: req.params.doctorId });
    const reviews = await Review.find({ doctorId: req.params.doctorId })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
