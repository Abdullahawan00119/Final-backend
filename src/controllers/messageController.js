const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType, relatedJob, relatedService, relatedOrder } = req.body;
    const senderId = req.user.id;

    // Create or find conversation
    const participants = [senderId, receiverId].sort();
    const conversationId = participants.join('_');

    let conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      conversation = await Conversation.create({
        conversationId,
        participants,
        relatedJob,
        relatedService,
        relatedOrder
      });
    }

    const message = await Message.create({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      content,
      messageType
    });

    // Update conversation last message
    conversation.lastMessage = {
      content,
      sender: senderId,
      createdAt: message.createdAt
    };
    await conversation.save();

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'firstName lastName avatar')
      .sort('-updatedAt');
    
    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages in conversation
// @route   GET /api/messages/conversations/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort('createdAt');
    
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
