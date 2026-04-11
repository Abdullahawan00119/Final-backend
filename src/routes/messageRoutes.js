const express = require('express');
const {
  sendMessage,
  getConversations,
  getMessages
} = require('../controllers/messageController');

const router = express.Router();

const { authenticate } = require('../middleware/authenticate');

// All routes are protected
router.use(authenticate);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId', getMessages);

module.exports = router;
