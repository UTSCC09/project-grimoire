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
        ref : "User",
    },
    members: {
        type: [ObjectId],
        required: false
    },
    game: {
        type: ObjectId,
        required: true,
        ref: "Game",
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: false
        },
        coordinates: {
            type: [Number],
            required: false
        }
    },
    preferences: {
        combat: {
            type: Number,
            required: false,
            default: 0
        },
        puzzles: {
            type: Number,
            required: false,
            default: 0
        },
        social: {
            type: Number,
            required: false,
            default: 0
        },
        playerDriven: {
            type: Number,
            required: false,
            default: 0
        },
        roleplaying: {
            type: Number,
            required: false,
            default: 0
        },
        homebrew: {
            type: Number,
            required: false,
            default: 0
        },
    }
})

export const Group = new mongoose.model("Group", GroupSchema)