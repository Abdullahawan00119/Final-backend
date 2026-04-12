const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.authenticate = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    console.log('[AUTH] No Bearer token provided');
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH] Token verified for userId:', decoded.userId);

    // Get user from token
    req.user = await User.findById(decoded.userId);
    console.log('[AUTH] DB lookup result:', req.user ? `found ${req.user.email}` : 'NOT FOUND');
    if (!req.user) {
      console.log('[AUTH] User document missing for id:', decoded.userId);
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (req.user.isBlocked) {
      console.log('[AUTH] Blocked user attempt:', req.user.email);
      return res.status(403).json({ success: false, message: 'Account is blocked' });
    }

    console.log('[AUTH] Auth success for:', req.user.email, req.user.role);
    next();
  } catch (err) {
    console.log('[AUTH] JWT verification error:', err.message);
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

