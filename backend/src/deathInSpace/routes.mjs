import { Router } from "express";
import { isAuthenticated, rollNSidedDie, randomNumberBetween } from "../helper.mjs";
import { DISMutation, DISOrigin, DeathInSpaceSheet } from "./schema.mjs";
import { Game, User, UserSheetMapping } from "../schemas.mjs";
import { addStartingBonus } from "./sheets.mjs";
import mongoose, {mongo} from 'mongoose'

const disRouter = Router()

disRouter.post("/random", isAuthenticated, async (req, res, next) => {

    let json = req.body
    const user = await User.findById(req.userId).exec()
    if(!user){
        return res.status(404).json({body: `user with id ${req.userId} not found`})
    }
    const game = await Game.findOne({name: "Death In Space"}).exec()
    //pick a random origin in between it and its length
        
    const dex = randomNumberBetween(3, -3)
    const hitPoints = rollNSidedDie(8)

    const origins = await DISOrigin.find({}).exec()
    const randomOrigin = origins[randomNumberBetween(origins.length - 1)]
    const stats = {
        bdy: randomNumberBetween(3, -3), //random number between 3 and -3
        dex: dex,
        svy: randomNumberBetween(3, -3),
        tech: randomNumberBetween(3, -3),
    } 
    let deathInSpaceSheet = new DeathInSpaceSheet({
        owner: user._id, 
        game: game._id, 
        characterName: json.name,

        stats: stats,
        inventory: [],
        mutations: [],
        voidPoints: 0,
        defenseRating: 12 + dex,
        maxHitPoints: hitPoints,
        hitPoints: hitPoints,
        origin: randomOrigin._id,
        originBenefit: randomNumberBetween(randomOrigin.benefits.length - 1)
    })

    const errors = deathInSpaceSheet.validateSync()
    if(errors && errors.errors.length > 0){
        return res.status(403).json({errors: errors.errors})
    }
    //check if needed to add anything else to the character sheet because of poor roles 
    //(p.20) of the rule book

    //if have negative net value for stats
    if(Object.keys(stats).reduce((sum, stat) => sum + stats[stat], 0) < 0){
        //add starting bonus
        deathInSpaceSheet = await addStartingBonus(deathInSpaceSheet)
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    deathInSpaceSheet.save().then((saved) => {
        //creating the user-game-sheet mapping
        const mapping = new UserSheetMapping({
            game: saved.game,
            user: saved.owner,
            sheet: saved._id,
            sheetModel: deathInSpaceSheet.constructor.modelName
        })
        mapping.save().then(async (savedMap) => {
            session.commitTransaction()
            .then(() => session.endSession())
            .then(() => res.status(201).json({saved}))
        }).catch(async (err) => {
            session.abortTransaction()
            .then(() => session.endSession())
            .then(() => res.status(400).json({errors: err}))
        })
    }).catch(err => {
        if(err.name === "ValidationError"){
            return res.status(400).json({error: err.errors})
        }
        return res.status(500).json(err.errors)
    })
})


disRouter.post("/create", isAuthenticated, async(req, res, next) => {
    let json = req.body
    const user = await User.findById(req.userId).exec()
    if(!user){
        return res.status(404).json({body: `user with id ${req.userId} not found`})
    }
    const game = await Game.findOne({name: "Death In Space"}).exec()
    //pick a random origin in between it and its length

    const stats = !json.stats ? {} : {
        bdy: json.stats.bdy, //random number between 3 and -3
        dex: json.stats.dex,
        svy: json.stats.svy,
        tech: json.stats.tech,
    }
        
    let deathInSpaceSheet = new DeathInSpaceSheet({
        owner: user._id, 
        game: game._id, 
        characterName: json.name,

        stats: stats,
        inventory: json.inventory,
        mutations: json.mutations,
        voidPoints: 0,
        defenseRating: 12 + json.stats.dex,
        maxHitPoints: json.hitPoints,
        hitPoints: json.hitPoints,
        origin: json.origin,
        originBenefit: json.originBenefit
    })

    const errors = deathInSpaceSheet.validateSync()
    if(errors && errors.errors.length > 0){
        return res.status(403).json({errors: errors.errors})
    }
    //check if needed to add anything else to the character sheet because of poor roles 
    //(p.20) of the rule book

    //if have negative net value for stats
    if(!json.addedBonus && Object.keys(stats).reduce((sum, stat) => sum + stats[stat], 0) < 0){
        //add starting bonus
        deathInSpaceSheet = await addStartingBonus(deathInSpaceSheet)
    }
    //starting a transaction to make sure both sheets get saved
    const session = await mongoose.startSession();
    session.startTransaction();
    deathInSpaceSheet.save().then((saved) => {
        //creating the user-game-sheet mapping
        const mapping = new UserSheetMapping({
            game: saved.game,
            user: saved.owner,
            sheet: saved._id,
            sheetModel: "DISSheet"
        })
        mapping.save().then(async (savedMap) => {
            await session.commitTransaction()
            await session.endSession()
            return res.status(201).json({saved})
        }).catch(async (err) => {
            await session.abortTransaction()
            await session.endSession()
            throw err
        })
    }).catch(err => {
        if(err.name === "ValidationError"){
            return res.status(403).json({error: err.errors})
        }
        return res.status(500).json(err.errors)
    })
})

export default disRouter