const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { order, overallRating, comment, ratings } = req.body;

    const orderDoc = await Order.findById(order);
    if (!orderDoc) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderDoc.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed orders' });
    }

    // Verify user is part of the order (customer reviewing provider)
    if (orderDoc.customer.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to review this order' });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ order });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already exists for this order' });
    }

    const review = await Review.create({
      reviewer: req.user.id,
      reviewee: orderDoc.provider,
      order,
      service: orderDoc.service, // Link to the service
      overallRating,
      comment,
      ratings
    });

    // Update user average rating
    const reviews = await Review.find({ reviewee: orderDoc.provider });
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.overallRating + acc, 0) / totalReviews;

    await User.findByIdAndUpdate(orderDoc.provider, {
      averageRating: avgRating.toFixed(1),
      totalReviews
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'firstName lastName avatar')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
