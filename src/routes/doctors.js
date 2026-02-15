const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { protect, authorizeDoctor } = require('../middleware/auth');

// @route   GET /api/doctors
// @desc    Get all doctors with filters and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { specialization, minRating, isVerified, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (isVerified === 'true') {
      query.isVerified = true;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find doctors with pagination
    const doctors = await Doctor.find(query)
      .populate('userId', 'name email phone profileImage')
      .sort({ rating: -1, totalReviews: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Doctor.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        doctors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   GET /api/doctors/profile
// @desc    Get doctor profile (authenticated doctor)
// @access  Private (Doctor only)
router.get('/profile', protect, authorizeDoctor, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email phone profileImage'
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   PUT /api/doctors/profile
// @desc    Update doctor profile
// @access  Private (Doctor only)
router.put('/profile', protect, authorizeDoctor, async (req, res) => {
  try {
    const { specialization, licenseNumber, qualification, experience, consultationFee, availableSlots, bio, services } =
      req.body;

    // Find doctor profile
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    // Update fields if provided
    if (specialization !== undefined) doctor.specialization = specialization;
    if (licenseNumber !== undefined) doctor.licenseNumber = licenseNumber;
    if (qualification !== undefined) doctor.qualification = qualification;
    if (experience !== undefined) doctor.experience = experience;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (availableSlots !== undefined) doctor.availableSlots = availableSlots;
    if (bio !== undefined) doctor.bio = bio;
    if (services !== undefined) doctor.services = services;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: doctor,
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get single doctor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone profileImage');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
