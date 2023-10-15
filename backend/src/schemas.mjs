const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

import mongoose from 'mongoose';

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    }
});

export const User = mongoose.model("User", UserSchema)