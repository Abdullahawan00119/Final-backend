const express = require('express');
const { 
  getNotifications, 
  markAsRead, 
  markAllRead,
  getUnreadCount
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/unread-count', getUnreadCount);
router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
