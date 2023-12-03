import { Router } from "express";
import { server } from "../app.mjs";
import { isAuthenticated } from "../helper.mjs";
import { Message } from "./schema.mjs";
import { Game, User } from "../schemas.mjs";
import { Group } from "../groups/schema.mjs";
import mongoose, {isValidObjectId, mongo} from 'mongoose'
import * as Server from 'socket.io';

export const messageRouter = Router()

const io = new Server.Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: 'http://localhost:3000',
    },
  });

messageRouter.get('/messages/:groupId', isAuthenticated, async (req, res) => {
    const groupId = req.params.groupId
    if (!isValidObjectId(groupId)) {
        return res.status(400).json({ message: "Invalid group id" })
    }
    const messages = await Message.find({ group: groupId })
    .populate({
        path: 'sender',
        model: User,
        select: 'username'
    })
    .populate({
        path: 'group',
        model: Group,
        select: 'name'
    })
    return res.status(200).json(messages)
})

messageRouter.post('/messages/:groupId', isAuthenticated, async (req, res) => {
    const groupId = req.params.groupId
    if (!isValidObjectId(groupId)) {
        return res.status(400).json({ message: "Invalid group id" })
    }
    // const message = new Message({
    //     sender: req.user._id,
    //     content: req.body.content,
    //     group: groupId
    // })
    let message = await Message.create({ sender: req.user._id, content: req.body.content, group: groupId })
    message = await (
        await message.populate('sender', 'username')
    ).populate({
        path: 'group',
        model: Group,
        select: 'name',
        populate: {
            path: 'users',
            model: User,
            select: 'username'
        }
    })
    return res.status(200).json(message)
})


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

export default messageRouter