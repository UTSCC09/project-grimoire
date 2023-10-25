const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

import mongoose, { mongo } from 'mongoose';
import { InventoryItemSchema, CharacterSheetSchema } from '../schemas.mjs';

const DISInventorySchema = new Schema({
    basicInfo: {
        type: InventoryItemSchema,
        required: true
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
        required: true
    },
    //stat used in rolls
    modifier: {
        type: String,
        required: true
    },
    uses: {
        type: Number,
        required: false
    },
    type: {
        type: String,
        required: false
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
    }
})

export const DISArmor = new mongoose.model("DISArmor", DISArmorSchema)

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
    },
    inventory: [DISInventorySchema],
    weapons: [DISWeaponSchema],
    armor: [DISArmorSchema]
})

export const DeathInSpaceSheet = new mongoose.model('DISSheet', DISSheetSchema) 