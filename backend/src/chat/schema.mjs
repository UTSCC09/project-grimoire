const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

import mongoose, { mongo } from 'mongoose';

export const messageSchema = new Schema({
    sender: {
        type: ObjectId,
        required: true,
        ref : "User",
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    group: {
        type: ObjectId,
        required: true,
        ref: "Group",
    },
});

const Message = mongoose.model('Message', messageSchema);