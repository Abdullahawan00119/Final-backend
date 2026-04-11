const Notification = require('../models/Notification');

/**
 * Send a notification to a user
 * @param {Object} io - Socket.io instance
 * @param {Object} data - Notification data
 */
const sendNotification = async (io, { 
  recipient, 
  type, 
  title, 
  message, 
  data, 
  actionUrl 
}) => {
  try {
    // Create notification in DB
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      data,
      actionUrl,
      sentVia: ['in-app']
    });

    // Emit via Socket.io if io is provided
    if (io) {
      // Note: socketHandler maps userId to socketId, but we can also use rooms if users join their own room
      // Since socketHandler uses onlineUsers Map, we'd need access to it.
      // Alternatively, we can just emit to a room named after the userId.
      io.to(recipient.toString()).emit('notification_received', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

module.exports = { sendNotification };
