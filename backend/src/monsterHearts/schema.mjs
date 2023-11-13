const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

import mongoose, { mongo } from 'mongoose';
import { ImageSchema, InventoryItemSchema } from '../schemas.mjs';

const MHMoveSchema = new Schema({
    belongsTo: {
        type: ObjectId,
        ref: "MHSkins",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: "basic",
        enum : ['hex', 'bargain', "basic"]
    },
    isCore:{
        type: Boolean,
        required: true,
        default: false
    }
    
})

export const MHMoves = new mongoose.model("MHMoves", MHMoveSchema)

const MHSkinSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    statOptions: {
        type: [{hot : {
            type: Number,
            required: true
        },
        cold: {
            type: Number,
            required: true
        },
        volatile: {
            type: Number,
            required: true
        },
        dark: { 
            type: Number,
            required: true
        }}]
    },
    backstory: {
        type: [String],
        required: true
    },
    darkestSelf: {
        type: String,
        required: true
    },
    advancements: {
        type: [String],
        required: true
    },
    sexMove: {
        type: String,
        required: true
    },
    requiredMoves: {
        type: [ObjectId],
        ref: "MHMoves",
        required: true,
        default: []
    }
})

export const MHSkin = new mongoose.model("MHSkins", MHSkinSchema)

const MHStringSchema = new Schema({
    originator: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false
    }
})

const MHSheetSchema = new Schema({
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
        type: ImageSchema, //string will be a path to the uploaded picture
        required: false
    },
    skin: {
        type: ObjectId,
        ref: "MHSkins",
        required: true
    },
    stats: {
        hot : {
            type: Number,
            required: true
        },
        cold: {
            type: Number,
            required: true
        },
        volatile: {
            type: Number,
            required: true
        },
        dark: { 
            type: Number,
            required: true
        }
    },
    maxHitPoints: {
        type: Number,
        required: true,
        min: 0,
        default: 4
    },
    hitPoints: {
        type: Number,
        required: true,
        min: 0,
        default: 4
    },
    conditions: {
        type: [String],
        required: true,
        default: []
    },
    notes: {
        type: String,
        required: false
    },
    experience: {
        type: Number,
        required: false,
        default: 0,
        min: 0,
        max: 5
    },
    moves: {
        type: [ObjectId],
        ref: "MHMoves",
        required: true,
    },
    inventory: {
        type: [InventoryItemSchema],
        required: true,
        default: []
    },
    takenAdvancements: {
        type: [Number], //indicies corresponding to advancements of skin,
        required: false,
        default : []
    },
    strings: {
        type: [MHStringSchema],
        required: false,
        default: []
    },
    look : {
        type: String,
        required: false
    },
    origin: {
        type: String,
        required: false
    },
    eyes: {
        type: String,
        required: false
    }
}, {
    methods: {
        getPopulationFields(){
            return ['moves', 'skin']
        }
    }
})

export const MonsterHeartSheet = new mongoose.model("MHSheet", MHSheetSchema)