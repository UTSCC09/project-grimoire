const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

import mongoose, { mongo } from 'mongoose';

export const GroupSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    owner: {
        type: ObjectId,
        required: true,
        ref : "User"
    },
    members: {
        type: [ObjectId],
        required: false
    },
    game: {
        type: ObjectId,
        required: true,
        ref: "Game"
    },
})

export const Group = new mongoose.model("Group", GroupSchema)