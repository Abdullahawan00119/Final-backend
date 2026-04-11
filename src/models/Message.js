const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  content: { type: String, required: true },
  
  attachments: [{
    type: { type: String, enum: ['image', 'document', 'video'] },
    url: String,
    fileName: String,
    fileSize: Number
  }],
  
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isDeleted: { type: Boolean, default: false },
  
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
