const express = require('express');
const { createReview, getUserReviews } = require('../controllers/reviewController');
const { reviewValidator } = require('../validators/reviewValidator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.get('/user/:userId', getUserReviews);

// Protected routes
router.use(authenticate);
router.post('/', reviewValidator, validate, createReview);

module.exports = router;
