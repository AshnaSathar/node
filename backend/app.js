const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const users = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle private chat room setup
  socket.on('joinPrivateChat', (otherUserId) => {
    const roomId = getPrivateChatRoomId(socket.id, otherUserId);
    socket.join(roomId);
    users[socket.id] = otherUserId;
    users[otherUserId] = socket.id;
    console.log(`${socket.id} joined private chat with ${otherUserId}`);
  });

  // Handle private messages
  socket.on('privateMessage', ({ message, receiverUserId }) => {
    const senderUserId = socket.id;
    const roomId = getPrivateChatRoomId(senderUserId, receiverUserId);
    io.to(roomId).emit('privateMessage', { senderUserId, message });
    console.log(`${senderUserId} sent a private message to ${receiverUserId}: ${message}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const otherUserId = users[socket.id];
    delete users[socket.id];
    delete users[otherUserId];
  });
});

function getPrivateChatRoomId(userId1, userId2) {
  return userId1 < userId2 ? `${userId1}-${userId2}` : `${userId2}-${userId1}`;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
