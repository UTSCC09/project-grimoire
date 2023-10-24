const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

import mongoose, { mongo } from 'mongoose';

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


const GameSchema = new Schema({
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

const StatSchema = new Schema({
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

const InventoryItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: false
    },
    weight: {
        type: Number,
        required: false
    }
})

const CharacterSheetSchema = new Schema({
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
    inventory: {
        type: [InventoryItemSchema],
        required: false
    },
    notes: {
        type: String
    }
})

export const CharacterSheet = new mongoose.model("CharacterSheet", CharacterSheetSchema)

const DISMutationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

export const DISMutation = new mongoose.model("DISMutation", DISMutationSchema)

const DISOriginSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    benefits: {
        type: [{name: String, description: String}],
        required: true
    },
    description:{
        type: String
    }
})

export const DISOrigin = new mongoose.model("DISOrigin", DISOriginSchema)

const DISSheetSchema = new Schema({
    baseCharacterSheet : {
        type: CharacterSheetSchema,
        required: true
    },
    mutations : {
        type: [ObjectId],
        ref: "DISMutation",
        required: false
    },
    voidPoints: {
        type: Number,
        required: true,
        default: 0,
        min:0,
        max: 4
    },
    defenseRating : {
        type: Number,
        required: true,
        default: 12,
        min: 7
    },
    maxHitPoints: {
        type:Number,
        required: true,
        min: 1
    },
    hitPoints: {
        type: Number,
        required: true
    },
    origin: {
        type: ObjectId,
        required: true,
        ref: "DISOrigin"
    },
    //index in the origin's benefit array
    originBenefit: {
        type: Number,
        required: true
    },
    lifeSupport: {
        type: Number,
        min: 0,
        max: 100,
        default: 100,
        required: true
    },
    experiencePoints: {
        type: Number,
        min: 0,
        default: 0,
        required: true
    },
    holos: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    }
})

export const DeathInSpaceSheet = new mongoose.model('DISSheet', DISSheetSchema)