import { Router } from "express";
import { isAuthenticated } from "../helper.mjs";
import { Message } from "./schema.mjs";
import { Game, User } from "../schemas.mjs";
import { Group } from "../groups/schema.mjs";
import mongoose, {isValidObjectId, mongo} from 'mongoose'
import { io } from "socket.io-client";

export const messageRouter = Router()

messageRouter.get('/messages/:groupId', isAuthenticated, async (req, res) => {
    const groupId = req.params.groupId
    if (!isValidObjectId(groupId)) {
        return res.status(400).json({ message: "Invalid group id" })
    }
    const messages = await Message.find({ group: groupId }).sort( {createdAt: 1} )
    return res.status(200).json(messages)
})

// get latest 100 messages from a group
messageRouter.get('/messages/:groupId/latest', isAuthenticated, async (req, res) => {
    const groupId = req.params.groupId
    if (!isValidObjectId(groupId)) {
        return res.status(400).json({ message: "Invalid group id" })
    }
    const messages = await Message.find({ group: groupId }).sort( {createdAt: 1} ).limit(100)
})

messageRouter.post('/messages/:groupId', isAuthenticated, async (req, res) => {
    const groupId = req.params.groupId
    if (!isValidObjectId(groupId)) {
        return res.status(400).json({ message: "Invalid group id" })
    }
    const message = new Message({
        sender: req.user._id,
        content: req.body.content,
        group: groupId
    })
    await message.save()
    return res.status(200).json(message)
})

// delete message if user sent it
messageRouter.delete('/messages/:messageId', isAuthenticated, async (req, res) => {
    const messageId = req.params.messageId
    if (!isValidObjectId(messageId)) {
        return res.status(400).json({ message: "Invalid message id" })
    }
    const message = await Message.findById(messageId)
    if (!message) {
        return res.status(404).json({ message: "Message not found" })
    }
    if (message.sender != req.user._id) {
        return res.status(403).json({ message: "You are not the sender of this message" })
    }
    await message.delete()
    return res.status(200).json({ message: "Message deleted" })
})


//socket io connection
io.on('connection', (socket) => {
    let roomid, username;
    // var room,user;
    socket.on('disconnect', () => {
        console.log("connection closed");
    })
    socket.on("new-join", ({ user, room }) => {
        socket.join(room);
        roomid = room;
        username = user;
        console.log("new joined");
    })
    socket.on("new-msg", (msg) => {
        socket.to(roomid).emit('new-msg', msg);
        Message.create(msg, (err, data) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log("data sent to database")
            }
        })
    })
})

export default messageRouter