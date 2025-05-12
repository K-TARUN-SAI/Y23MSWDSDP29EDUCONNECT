const { Server } = require('socket.io');
const http = require('http');

const configureWebRTCServer = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId);

      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId);
      });

      socket.on('signal', ({ to, signal }) => {
        io.to(to).emit('signal', { from: userId, signal });
      });
    });
  });

  return server;
};

module.exports = configureWebRTCServer;