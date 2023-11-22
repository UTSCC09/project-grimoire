import { Router } from "express";
import { isAuthenticated } from "../helper.mjs";
import { Message } from "./schema.mjs";
import { Game, User } from "../schemas.mjs";
import { Group } from "../groups/schema.mjs";
import mongoose, {isValidObjectId, mongo} from 'mongoose'

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

const server = app.listen(8080, () => { console.log("Listening on port 8080") })
const wsServer = new ws.WebSocketServer({ server });
wsServer.on('request', async function (request) {
    const connection = request.accept(null, request.origin);
    let index = clients.push(connection) - 1;

    console.log("connected")

    connection.on('message', async function (message) {
        const data = JSON.parse(message.utf8Data)
        if (data.type === "message") {
            const message = new Message({
                sender: data.sender,
                content: data.content,
                group: data.group
            })
            await message.save()
            wsServer.clients.forEach(function (client) {
                if (client !== connection && client.readyState === ws.OPEN) {
                    client.send(JSON.stringify({ type: "message", message: message }))
                }
            })
        }
    });
    connection.on('close', function (connection) {
        clients.splice(index, 1);
        console.log("closed")
    });
})

export default messageRouter