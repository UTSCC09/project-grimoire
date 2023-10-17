const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

import mongoose from 'mongoose';

const UserSchema = new Schema({
    username: {
        type: String,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        required: false
    },
    isMember: {
        type: Boolean,
        required: true,
        default: false
    }
});

export const User = mongoose.model("User", UserSchema)