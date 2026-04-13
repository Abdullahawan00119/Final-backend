const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Order = require('../models/Order');
const Service = require('../models/Service');

// @desc    Get dashboard stats
// @route   GET /api/users/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    
    let stats = {};

    if (role === 'customer') {
      const activeJobs = await Job.countDocuments({ postedBy: userId, status: 'open' });
      const inProgressJobs = await Job.countDocuments({ postedBy: userId, status: 'in-progress' });
      const activeOrders = await Order.countDocuments({ customer: userId, status: { $in: ['pending', 'in-progress', 'delivered'] } });
      const completedOrders = await Order.countDocuments({ customer: userId, status: 'completed' });
      
      const spending = await Order.aggregate([
        { $match: { customer: req.user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      stats = {
        activeJobs,
        activeOrders,
        completedOrders,
        totalSpent: spending[0]?.total || 0,
        recentJobs: await Job.find({ postedBy: userId }).sort('-createdAt').limit(5)
      };
    } else {
      const activeOrders = await Order.countDocuments({ provider: userId, status: { $in: ['pending', 'in-progress', 'delivered'] } });
      const completedOrders = await Order.countDocuments({ provider: userId, status: 'completed' });
      const activeServices = await Service.countDocuments({ provider: userId });

      const earnings = await Order.aggregate([
        { $match: { provider: req.user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      stats = {
        activeOrders,
        completedOrders,
        activeServices,
        totalEarnings: earnings[0]?.total || 0,
        recentOrders: await Order.find({ provider: userId }).sort('-createdAt').limit(5).populate('customer', 'firstName lastName avatar')
      };
    }

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -isEmailVerified -isPhoneVerified -verificationToken');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    // Build update object, only including fields that were actually sent
    const fieldsToUpdate = {};

    if (req.body.firstName !== undefined) fieldsToUpdate.firstName = req.body.firstName;
    if (req.body.lastName !== undefined) fieldsToUpdate.lastName = req.body.lastName;
    if (req.body.bio !== undefined) fieldsToUpdate.bio = req.body.bio;
    if (req.body.phone !== undefined) fieldsToUpdate.phone = req.body.phone;
    if (req.body.avatar !== undefined) fieldsToUpdate.avatar = req.body.avatar;
    if (req.body.skills !== undefined) fieldsToUpdate.skills = req.body.skills;
    if (req.body.hourlyRate !== undefined) fieldsToUpdate.hourlyRate = req.body.hourlyRate;
    if (req.body.yearsOfExperience !== undefined) fieldsToUpdate.yearsOfExperience = req.body.yearsOfExperience;
    if (req.body.certifications !== undefined) fieldsToUpdate.certifications = req.body.certifications;

    // Handle nested location object
    if (req.body.location) {
      if (req.body.location.city) fieldsToUpdate['location.city'] = req.body.location.city;
      if (req.body.location.area !== undefined) fieldsToUpdate['location.area'] = req.body.location.area;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
