import dotenv from 'dotenv'
import * as Server from 'socket.io';
import { server } from "../app.mjs";

dotenv.config();

const io = new Server.Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: process.env.FRONTEND,
    },
  });

//socket io connection
io.on('connection', (socket) => {
    socket.on('setup', (userData) => {
      socket.join(userData.id);
      socket.emit('connected');
    })
    socket.on('join room', (room) => {
      socket.join(room)
    })
  
    socket.on('new message', (newMessageRecieve) => {
      var chat = newMessageRecieve.chatId
      if (!chat.users) console.log('chats.users is not defined')
      chat.users.forEach((user) => {
        if (user._id == newMessageRecieve.sender._id) return
        socket.in(user._id).emit('message recieved', newMessageRecieve)
      })
    })
})