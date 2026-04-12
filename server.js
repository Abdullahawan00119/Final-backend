const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./src/utils/db');

dotenv.config();

console.log('Server starting...');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('PORT:', process.env.PORT || 5000);
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);

const PORT = process.env.PORT || 5000;

// Async main function
const startServer = async () => {
  try {
    // Connect to Database first
    await connectDB();
    
    const server = http.createServer(app);

    // Socket.io Setup
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    app.set('io', io);

    const socketHandler = require('./src/socket/socketHandler');
    socketHandler(io);

    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
