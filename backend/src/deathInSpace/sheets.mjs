import mongoose, { mongo } from 'mongoose';
import { randomNumberBetween, rollNSidedDie } from "../helper.mjs";
import { DISArmor, DISInventoryItem, DISWeapon, DISMutation} from "./schema.mjs";

export async function addStartingBonus(sheet){
    //getting index in Bonus table
    const bonus = rollNSidedDie(6)
    console.log("adding bonus", bonus)
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
            let eva = await DISArmor.findOne({'base.basicInfo.name' : "Heavy EVA Suit"}).exec()
            eva.condition = rollNSidedDie(eva.base.maxCondition)
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
                basicInfo: {
                    name: "AI Pet",
                    description: `An AI guard animal DR 13 ${rollNSidedDie(4)} HP, bite (1d6).`
                }
            })
            sheet.inventory.push(AiPet)
            break;
        case 6:
            const bestFriendJoe = await new DISInventoryItem({
                basicInfo: {
                    name : "Old Crew Member",
                    description: `An old crew member (0 in all abilities, DR 12, ${rollNSidedDie(6)} HP). You have always been close`
                }
            })
            sheet.inventory.push(bestFriendJoe)
            break;
        default:
            break;
    }
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