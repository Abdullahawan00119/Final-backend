const express = require('express');
const {
  getUserProfile,
  updateProfile,
  getDashboardStats
} = require('../controllers/userController');

const router = express.Router();

const { authenticate } = require('../middleware/authenticate');

// Protected routes
router.get('/stats', authenticate, getDashboardStats);
router.put('/profile', authenticate, updateProfile);

// Public profile
router.get('/:id', getUserProfile);

module.exports = router;
