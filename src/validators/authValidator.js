const { body } = require('express-validator');

exports.registerValidator = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('area').notEmpty().withMessage('Area is required'),
  body('role').isIn(['customer', 'provider']).withMessage('Role must be either customer or provider'),
];

exports.loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];
