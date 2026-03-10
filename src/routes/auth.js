const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { generateToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, userType, phone, address, dateOfBirth, gender } = req.body;

    // Validation
    if (!email || !password || !name || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: email, password, name, userType',
      });
    }

    if (!['user', 'doctor'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'User type must be either "user" or "doctor"',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      userType,
      phone,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
    });

    // If user is a doctor, create doctor profile
    if (userType === 'doctor') {
      await Doctor.create({
        userId: user._id,
        specialization: 'General',
        licenseNumber: `TEMP-${Date.now()}`,
        qualification: ['To be updated'],
        experience: 0,
        consultationFee: 0,
        bio: '',
        services: [],
        isVerified: false,
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      userType: user.userType,
    });

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      profileImage: user.profileImage,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);

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

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      userType: user.userType,
    });

    // Get doctor profile if user is a doctor
    let doctorProfile = null;
    if (user.userType === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      profileImage: user.profileImage,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      doctorProfile: doctorProfile
        ? {
            _id: doctorProfile._id,
            specialization: doctorProfile.specialization,
            licenseNumber: doctorProfile.licenseNumber,
            qualification: doctorProfile.qualification,
            experience: doctorProfile.experience,
            consultationFee: doctorProfile.consultationFee,
            rating: doctorProfile.rating,
            totalReviews: doctorProfile.totalReviews,
            bio: doctorProfile.bio,
            isVerified: doctorProfile.isVerified,
          }
        : null,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // Get doctor profile if user is a doctor
    let doctorProfile = null;
    if (req.user.userType === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: req.user._id });
    }

    const userResponse = {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      userType: req.user.userType,
      phone: req.user.phone,
      address: req.user.address,
      dateOfBirth: req.user.dateOfBirth,
      gender: req.user.gender,
      profileImage: req.user.profileImage,
      isActive: req.user.isActive,
      isEmailVerified: req.user.isEmailVerified,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
      doctorProfile: doctorProfile
        ? {
            _id: doctorProfile._id,
            specialization: doctorProfile.specialization,
            licenseNumber: doctorProfile.licenseNumber,
            qualification: doctorProfile.qualification,
            experience: doctorProfile.experience,
            consultationFee: doctorProfile.consultationFee,
            availableSlots: doctorProfile.availableSlots,
            rating: doctorProfile.rating,
            totalReviews: doctorProfile.totalReviews,
            bio: doctorProfile.bio,
            services: doctorProfile.services,
            isVerified: doctorProfile.isVerified,
          }
        : null,
    };

    res.status(200).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, phone, address, dateOfBirth, gender, profileImage } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (dateOfBirth) updateFields.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateFields.gender = gender;
    if (profileImage !== undefined) updateFields.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Password reset token generated. Use this token to reset your password.',
      data: { resetToken },
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a password with at least 6 characters',
      });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify user email
// @access  Private
router.post('/verify-email', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isEmailVerified: true },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: user,
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
