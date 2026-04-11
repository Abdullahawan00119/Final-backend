const { body } = require('express-validator');

exports.reviewValidator = [
  body('order').notEmpty().withMessage('Order ID is required'),
  body('overallRating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required').isLength({ max: 1000 }),
];
