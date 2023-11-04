import mongoose, { mongo } from 'mongoose';
import { randomNumberBetween, rollNSidedDie } from "../helper.mjs";
import { DISArmor, DISInventoryItem, DISWeapon, DISMutation, DISStartingEquipment} from "./schema.mjs";

/**
 * adds a random starting bonus to a character sheet if stats don't meet requirements
 * 
 * @param {Object} sheet object representing a death in space character sheet 
 * @returns {Object} sheet with the added starting bonus
 */
export async function addStartingBonus(sheet){
    //getting index in Bonus table
    const bonus = rollNSidedDie(6)
    switch(bonus){
        case 1:
            const mutation = await rollCosmicMutation(sheet.mutations)
            if(mutation)
                sheet.mutations.push(mutation._id)
            break;
        case 2:
            sheet.maxHitPoints += 3
            sheet.hitPoints += 3
            break;
        case 3:
            let eva = await DISArmor.findOne({'base.name' : "Heavy EVA Suit"}).exec()
            eva._id = new mongoose.Types.ObjectId()
            eva.isNew = true
            sheet.armor.push(eva)
            break;
        case 4:
            const weapons = await DISWeapon.find({type:'pistol'}).exec()
            let weapon = weapons[randomNumberBetween(weapons.length - 1)] 
            weapon.condition = rollNSidedDie(weapon.base.maxCondition)
            weapon._id = new mongoose.Types.ObjectId()
            weapon.isNew = true 
            sheet.weapons.push(weapons[randomNumberBetween(weapons.length)])
            break;
        case 5:
            const AiPet = await new DISInventoryItem({
                name: "AI Pet",
                description: `An AI guard animal DR 13 ${rollNSidedDie(4)} HP, bite (1d6).`
            })
            sheet.inventory.push(AiPet)
            break;
        case 6:
            const bestFriendJoe = await new DISInventoryItem({
                name : "Old Crew Member",
                description: `An old crew member (0 in all abilities, DR 12, ${rollNSidedDie(6)} HP). You have always been close`
            })
            sheet.inventory.push(bestFriendJoe)
            break;
        default:
            break;
    }
    return sheet
}

export async function addStartingEquip(sheet){
    const allStartingEquip = await DISStartingEquipment.find({}).exec()
    if(allStartingEquip.length <= 0)
        return sheet
    const randomEquip = allStartingEquip[randomNumberBetween(allStartingEquip.length - 1, 0)]
    sheet.inventory = sheet.inventory.concat(randomEquip.items)
    sheet.weapons = sheet.weapons.concat(randomEquip.weapons)
    sheet.armor = sheet.armor.concat(randomEquip.armor)
    return sheet
}   

export async function rollCosmicMutation(prexistingMutations){
    if(!(prexistingMutations instanceof Array)){
        prexistingMutations = []
    }
    const availableMutations = await DISMutation.find({_id: {$nin : prexistingMutations}}).exec()
    if(availableMutations.length == 0)
        return null
    return availableMutations[randomNumberBetween(availableMutations.length)]
}