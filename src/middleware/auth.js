const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Protect routes - check if user is authenticated
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Get user from token (exclude password)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Check if user is a doctor
const authorizeDoctor = (req, res, next) => {
  if (req.user && req.user.userType === 'doctor') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only doctors can access this route.',
    });
  }
};

// Check if user is a patient
const authorizeUser = (req, res, next) => {
  if (req.user && req.user.userType === 'user') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only patients can access this route.',
    });
  }
};

module.exports = {
  protect,
  authorizeDoctor,
  authorizeUser,
};
