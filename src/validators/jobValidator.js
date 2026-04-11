const { body } = require('express-validator');

exports.jobValidator = [
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('budgetAmount').isFloat({ min: 0 }).withMessage('Budget must be a valid number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('budgetType').isIn(['fixed', 'hourly', 'negotiable']).withMessage('Invalid budget type'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.area').notEmpty().withMessage('Area is required'),
];

exports.applyValidator = [
  body('proposedPrice').isFloat({ min: 0 }).withMessage('Proposed price must be a valid number'),
  body('coverLetter').notEmpty().withMessage('Cover letter is required'),
  body('estimatedDuration').notEmpty().withMessage('Estimated duration is required'),
];
