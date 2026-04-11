const socketHandler = (io) => {
  const onlineUsers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('register_user', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId.toString()); // Join a room named after the userId
      console.log(`User ${userId} registered with socket ${socket.id} and joined room`);
    });

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on('send_message', (data) => {
      const { conversationId, receiverId, message } = data;
      
      // Emit to the conversation room
      io.to(conversationId).emit('new_message', message);

      // Also send notification if receiver is online but not in room
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('notification_received', {
          type: 'message_received',
          title: 'New Message',
          message: `You have a new message from ${message.sender}`,
          data: { conversationId }
        });
      }
    });

    socket.on('typing_start', (data) => {
      socket.to(data.conversationId).emit('user_typing', {
        userId: data.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.conversationId).emit('user_typing', {
        userId: data.userId,
        isTyping: false
      });
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;
