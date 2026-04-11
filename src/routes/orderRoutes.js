const express = require('express');
const {
  createOrder,
  getOrders,
  updateOrderStatus
} = require('../controllers/orderController');

const router = express.Router();

const { authenticate } = require('../middleware/authenticate');

// All routes are protected
router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
