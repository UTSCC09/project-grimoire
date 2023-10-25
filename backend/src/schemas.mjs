const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

import mongoose, { mongo } from 'mongoose';

export const UserSchema = new Schema({
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

export const Game = mongoose.model("Game", GameSchema)

export const StatSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    bonus: {
        type: String,
        required: false
    }
})

export const InventoryItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: false
    }
})

export const CharacterSheetSchema = new Schema({
    owner: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    game : {
        type: ObjectId,
        ref: "Game",
        required: true
    },
    characterName: {
        type: String,
        required: true
    },
    characterPortrait: {
        type: String, //string will be a path to the uploaded picture
        required: false
    },
    stats: {
        type: [StatSchema],
        required: false
    },
    notes: {
        type: String
    }
})

export const CharacterSheet = new mongoose.model("CharacterSheet", CharacterSheetSchema)