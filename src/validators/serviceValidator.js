const { body } = require('express-validator');

exports.serviceValidator = [
  body('title').notEmpty().withMessage('Service title is required'),
  body('description').notEmpty().withMessage('Service description is required'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Price must be a valid number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('deliveryTime').notEmpty().withMessage('Delivery time is required'),
  body('pricingType').isIn(['fixed', 'hourly', 'package']).withMessage('Invalid pricing type'),
];
