const express = require('express');
const router = express.Router();
const { protect, authorizeAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Article = require('../models/Article');

// @route   GET /api/admin/stats
// @desc    Get overall platform statistics
// @access  Admin only
router.get('/stats', protect, authorizeAdmin, async (req, res) => {
  try {
    // Count totals
    const totalUsers = await User.countDocuments({ userType: 'user' });
    const totalDoctors = await User.countDocuments({ userType: 'doctor' });
    const totalAdmins = await User.countDocuments({ userType: 'admin' });
    const totalAppointments = await Appointment.countDocuments();
    const totalArticles = await Article.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Count appointments by status
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    // Count active users
    const activeUsers = await User.countDocuments({ userType: 'user', isActive: true });
    const inactiveUsers = await User.countDocuments({ userType: 'user', isActive: false });

    // Count verified doctors
    const verifiedDoctors = await Doctor.countDocuments({ isVerified: true });
    const unverifiedDoctors = await Doctor.countDocuments({ isVerified: false });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({
      userType: 'user',
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const recentDoctors = await User.countDocuments({
      userType: 'doctor',
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalDoctors,
          totalAdmins,
          totalAppointments,
          totalArticles,
          totalReviews,
        },
        users: {
          active: activeUsers,
          inactive: inactiveUsers,
          recentRegistrations: recentUsers,
        },
        doctors: {
          verified: verifiedDoctors,
          unverified: unverifiedDoctors,
          recentRegistrations: recentDoctors,
        },
        appointments: {
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Admin only
router.get('/users', protect, authorizeAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const userType = req.query.userType || 'user'; // user or doctor
    const isActive = req.query.isActive;

    // Build query
    const query = { userType };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/admin/doctors
// @desc    Get all doctors with their profiles and ratings
// @access  Admin only
router.get('/doctors', protect, authorizeAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const isVerified = req.query.isVerified;

    // Build query
    const query = {};
    
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    if (search) {
      query.$or = [
        { specialization: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .populate('userId', 'name email phone address isActive createdAt')
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/admin/user/:id
// @desc    Get single user details
// @access  Admin only
router.get('/user/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If doctor, get doctor profile
    let doctorProfile = null;
    if (user.userType === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    // Get user's appointments
    const appointments = await Appointment.find({
      $or: [{ userId: user._id }, { doctorId: doctorProfile?._id }],
    })
      .populate('userId', 'name email')
      .populate('doctorId')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        user,
        doctorProfile,
        appointments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PUT /api/admin/user/:id/toggle-status
// @desc    Activate or deactivate user account
// @access  Admin only
router.put('/user/:id/toggle-status', protect, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admins from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: { _id: user._id, isActive: user.isActive } },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PUT /api/admin/doctor/:id/verify
// @desc    Verify or unverify doctor
// @access  Admin only
router.put('/doctor/:id/verify', protect, authorizeAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    doctor.isVerified = !doctor.isVerified;
    await doctor.save();

    res.json({
      success: true,
      message: `Doctor ${doctor.isVerified ? 'verified' : 'unverified'} successfully`,
      data: { doctor: { _id: doctor._id, isVerified: doctor.isVerified } },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating doctor verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   DELETE /api/admin/user/:id
// @desc    Delete user account (soft delete - deactivate)
// @access  Admin only
router.delete('/user/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admins from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    // Soft delete - just deactivate
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User account deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/admin/appointments
// @desc    Get all appointments
// @access  Admin only
router.get('/appointments', protect, authorizeAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = {};
    if (status) {
      query.status = status;
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('userId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
