const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

import mongoose, { mongo } from 'mongoose';

export const UserSchema = new Schema({
    username: {
        type: String,
        lowercase: true,
        required: true,
        index: true,
        unqiue: true
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

export const User = new mongoose.model("User", UserSchema)

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
    groupModel: {
        type: String,
        required: true,
    }
})

export const Group = new mongoose.model("Group", GroupSchema)

export const GameSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    mainDie : {
        type: Number, //number of sides for the die,
        required: false,
        default: 20
    }
})

export const Game = new mongoose.model("Game", GameSchema)

const sheetUserMappingSchema = new Schema({
    user: {
        type: ObjectId,
        required: true,
        ref : "User"
    },
    game : {
        type: ObjectId,
        required: true,
        ref: "Game"
    },
    sheet: {
        type: ObjectId,
        required: true,
        refPath: "sheetModel"
    },
    //should be the string form of the model that the sheet is
    sheetModel : {
        type: String,
        required: true,
        enum : ['DISSheet', 'MSSheet']
    }
})

export const UserSheetMapping = new mongoose.model("UserSheetMapping", sheetUserMappingSchema)

export const ImageSchema = new Schema({
    mimetype: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    encoding: {
        type: String,
        required: false
    },
    originalname: {
        type: String,
        required: false
    } 
})