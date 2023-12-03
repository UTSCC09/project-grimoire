const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

import mongoose, { mongo } from 'mongoose';
import { ImageSchema } from '../schemas.mjs';

const DISInventorySchema = new Schema({
    name: {
        type: String,
        required: true   
    },
    description: {
        type: String,
        required: false
    },
    condition: {
        type: Number,
        required: false
    },
    maxCondition: {
        type: Number,
        required: false
    },
    weight: {
        type: Number,
        required: false
    },
    cost: {
        type: Number,
        required: false
    },
})

export const DISInventoryItem = new mongoose.model("DISInventoryItem", DISInventorySchema)

const DISWeaponSchema = new Schema({
    base: {
        type: DISInventorySchema,
        required: true
    },
    damage: {
        type: String, //should be in the form of XdY or just flat number
        required: true,
    },
    //stat used in rolls
    modifier: {
        type: String,
        required: true,
        enum: ['bdy', 'svy', 'tech', 'dex']
    },
    uses: {
        type: Number,
        required: false
    },
    type: {
        type: String,
        required: false
    },
    equipped: {
        type: Boolean,
        default: false
    }
})

export const DISWeapon = new mongoose.model("DISWeapon", DISWeaponSchema)

const DISArmorSchema = new Schema({
    base: {
        type: DISInventorySchema,
        required: true
    },
    drBonus: {
        type: Number,
        min: 0
    },
    protectsAgainst: {
        type: String
    },
    type: {
        type: String
    },
    equipped: {
        type: Boolean,
        default: false
    }
})

export const DISArmor = new mongoose.model("DISArmor", DISArmorSchema)

const DISStartingEquipmentSchmea = new Schema({
    name: {
        type: String,
        required: true
    },
    items: {
        type: [DISInventorySchema],
        default: [],
        required: true
    },
    weapons: {
        type: [DISWeaponSchema],
        default: [],
        required: true
    },
    armor: {
        type: [DISArmorSchema],
        default: [],
        required: true
    }
})

export const DISStartingEquipment = new mongoose.model("DISStartingEquip", DISStartingEquipmentSchmea)

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
    owner: {
        type: ObjectId,
        ref: "User",
        required: true,
        immutable: true
    },
    game : {
        type: ObjectId,
        ref: "Game",
        required: true,
        immutable: true
    },
    characterName: {
        type: String,
        required: true
    },
    characterPortrait: {
        type: ImageSchema, //string will be a path to the uploaded picture
        required: false
    },
    stats: {
        type: {
            bdy : {
                type: Number,
                required: true
            },
            dex : {
                type: Number,
                required: true
            },
            svy : {
                type: Number,
                required: true
            },
            tech : {
                type: Number,
                required: true
            },
        },
        required: true
    },
    notes: {
        type: String,
        required: false
    },
    mutations : {
        type: [ObjectId],
        ref: "DISMutation",
        default: [],
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
        required: true,
        max: 1,
        min: 0
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
    },
    background: {
        type: String,
        required: false
    },
    drive: {
        type: String,
        required: false
    },
    looks: {
        type: String,
        required: false
    },
    pastAllegiance: {
        type: String,
        required: false
    },
    corruption: {
        type: [String],
        required: false
    },
    inventory: {
        type: [DISInventorySchema],
        default: []
    },
    weapons: {
        type: [DISWeaponSchema],
        default: []
    },
    armor: {
        type: [DISArmorSchema],
        default: []
    }
}, {
    methods: {
        getPopulationFields(){
            return ['origin', 'mutations', 'game']
        }
    },
    strict: true,
    strictQuery: true
})

export const DeathInSpaceSheet = new mongoose.model('DISSheet', DISSheetSchema) 