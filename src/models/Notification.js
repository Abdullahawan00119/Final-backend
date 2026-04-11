const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  type: { 
    type: String, 
    required: true,
    enum: [
      'job_applied', 'job_hired', 'job_completed',
      'service_ordered', 'order_accepted', 'order_delivered',
      'order_completed', 'order_cancelled',
      'message_received', 'review_received',
      'payment_received', 'system_announcement'
    ]
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  data: {
    userId: mongoose.Schema.Types.ObjectId,
    jobId: mongoose.Schema.Types.ObjectId,
    serviceId: mongoose.Schema.Types.ObjectId,
    orderId: mongoose.Schema.Types.ObjectId,
    messageId: mongoose.Schema.Types.ObjectId,
    reviewId: mongoose.Schema.Types.ObjectId
  },
  
  actionUrl: String,
  
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  sentVia: [{ type: String, enum: ['in-app', 'email', 'sms'] }],
  
  expiresAt: Date,
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
