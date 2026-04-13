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
      
      // Emit to receiver only (not sender), plus conversation room for offline/online safety
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId && receiverSocketId !== socket.id) {
        io.to(receiverSocketId).emit('new_message', message);
      }
      // Removed room emit to prevent sender receiving own message

      // Send notification to receiver
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('notification_received', {
          type: 'message_received',
          title: 'New Message',
          message: `You have a new message from ${message.sender}`,
          data: { conversationId }
        });
      }
    });

socket.on('typing', (data) => {
      socket.to(data.conversationId).emit('typing', data);
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.conversationId).emit('stop_typing', data);
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
