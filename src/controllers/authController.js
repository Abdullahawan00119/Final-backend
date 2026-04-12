const User = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phone, city, area } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      location: { city, area }
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('[REGISTER] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('[LOGIN] Login attempt for email:', email);

    if (!email || !password) {
      console.log('[LOGIN] Missing email or password');
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    console.log('[LOGIN] User found in DB:', !!user);
    if (!user) {
      console.log('[LOGIN] User not found:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    console.log('[LOGIN] Password correct:', isMatch);
    if (!isMatch) {
      console.log('[LOGIN] Wrong password for user:', user.email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      console.log('[LOGIN] User is blocked:', user.email);
      return res.status(403).json({ success: false, message: 'Account is blocked' });
    }

    console.log('[LOGIN] SUCCESS - sending tokens for user:', user.email, user.role);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('[LOGIN] Unexpected error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ success: true, data: {} });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
