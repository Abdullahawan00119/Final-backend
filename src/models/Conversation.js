const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  conversationId: { type: String, unique: true }, // composite: smaller_userId_larger_userId
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date
  },
  
  unreadCount: {
    type: Map,
    of: Number
  },
  
  relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  relatedService: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  
  isArchived: {
    type: Map,
    of: Boolean
  },
  
}, {
  timestamps: true
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
