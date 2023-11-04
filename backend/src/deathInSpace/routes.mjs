import { Router } from "express";
import { isAuthenticated, rollNSidedDie, randomNumberBetween } from "../helper.mjs";
import { DISArmor, DISInventoryItem, DISMutation, DISOrigin, DISStartingEquipment, DISWeapon, DeathInSpaceSheet } from "./schema.mjs";
import { Game, User, UserSheetMapping } from "../schemas.mjs";
import { addStartingBonus, addStartingEquip } from "./sheets.mjs";
import mongoose, {mongo} from 'mongoose'
import { DEFAULTLIMIT, DEFAULTPAGE } from "../app.mjs";

const disRouter = Router()

/**
 * gets death in space origins lining up with given pagination
 * 
 * @param {Number} page page that we want to paginate to
 * @param {Number} limit number of elements per page
 * 
 * @returns {Array[Object]} an array of origins
 */
disRouter.get('/origins', async (req, res, next) => {
    const page = req.query.page || DEFAULTPAGE
    const limit = req.query.limit || DEFAULTLIMIT

    DISOrigin.find({}, null, {skip: page * limit, limit:limit, sort: {name: -1}}).exec()
    .then((origins) => {
        return res.json(origins)
    }).catch(err => {
        return res.status(500).json(err)
    })
})

/**
 * gets death in space mutations lining up with given pagination
 * 
 * @param {Number} page page that we want to paginate to (default 0)
 * @param {Number} limit number of elements per page (default 10)
 * 
 * @returns {Array[Object]} an array of mutations
 */
disRouter.get('/mutations', async (req, res, next) => {
    const page = req.query.page || DEFAULTPAGE
    const limit = req.query.limit || DEFAULTLIMIT

    DISMutation.find({}, null, {skip: page * limit, limit:limit, sort: {name: -1}}).exec()
    .then((mutations) => {
        return res.json(mutations)
    }).catch(err => {
        return res.status(500).json(err)
    })
})

/**
 * gets death in space items lining up with given pagination
 * 
 * @param {Number} page page that we want to paginate to (default 0)
 * @param {Number} limit number of elements per page (default 10)
 * 
 * @returns {Array[Object]} an array of items
 */
disRouter.get('/items', async (req, res, next) => {
    const page = req.query.page || DEFAULTPAGE
    const limit = req.query.limit || DEFAULTLIMIT

    DISInventoryItem.find({}, null, {skip: page * limit, limit:limit, sort: {name: -1}}).exec()
    .then((docs) => {
        return res.json(docs)
    }).catch(err => {
        return res.status(500).json(err)
    })
    
})

/**
 * gets death in space weapons lining up with given pagination
 * 
 * @param {Number} page page that we want to paginate to (default 0)
 * @param {Number} limit number of elements per page (default 10)
 * 
 * @returns {Array[Object]} an array of weapons
 */
disRouter.get('/weapons', async (req, res, next) => {
    const page = req.query.page || DEFAULTPAGE
    const limit = req.query.limit || DEFAULTLIMIT

    DISWeapon.find({}, null, {skip: page * limit, limit:limit, sort: {name: -1}}).exec()
    .then((docs) => {
        return res.json(docs)
    }).catch(err => {
        return res.status(500).json(err)
    })
})

/**
 * gets death in space armor lining up with given pagination
 * 
 * @param {Number} page page that we want to paginate to (default 0)
 * @param {Number} limit number of elements per page (default 10)
 * 
 * @returns {Array[Object]} an array of armor
 */
disRouter.get('/armor', async (req, res, next) => {
    DISArmor.find({}, null, {skip: page * limit, limit:limit, sort: {name: -1}}).exec()
    .then((docs) => {
        return res.json(docs)
    }).catch(err => {
        return res.status(500).json(err)
    })
})

/**
 * gets death in space starting equipment lining up with given pagination
 * 
 * @param {Number} page page that we want to paginate to (default 0)
 * @param {Number} limit number of elements per page (default 10)
 * 
 * @returns {Array[Object]} an array of starting equipment
 */
disRouter.get('/startequip', async (req, res, next) => {
    DISStartingEquipment.find({}, null, {skip: page * limit, limit:limit, sort: {name: -1}}).exec()
    .then((docs) => {
        return res.json(docs)
    }).catch(err => {
        return res.status(500).json(err)
    })
})

/**
 * creates a fully randomized Death In space charactersheet, with logged in user as owner
 * 
 * @returns {Object} the randomized character sheet created for the user
 */
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

    //add starting equipment
    deathInSpaceSheet = await addStartingEquip(deathInSpaceSheet)

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

/**
 * Creates a death in space character sheet corresponding to passed json object
 * @param {Object} stats object corresponding to stats of the user, should have dex, body, etc. as shown in schema
 * @param {String} name name of the character to be created
 * @param {Array[Object]} inventory array of inventory objects corresponding to db schema
 * @param {Array[String]} muatations an array of objectIds corresponding to mutations items
 * @param {Number} hitPoints a number indicating the amount of starting hitpoints
 * @param {String} origin the id of the origin the user has chosen
 * @param {Number} originBenefit the index of the origin's benefits, represents the benefit they chose
 * @param {Boolean} addedBonus weather or not the user has already added their starting bonus (if their stats are too low)
 */
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

/**
 * An endpoint that updates a given character sheet
 * 
 * @param {String} id id of the charactersheet to be updated
 * @param {Object} json json whose key-value pairs represent the fields and updated values
 * 
 * @returns {Object} returns updated charactersheet
 */
disRouter.patch('/edit/:id', isAuthenticated, async (req, res, next) => {
    const sheet = await DeathInSpaceSheet.findById(req.params.id).exec()
    if(!sheet)
        return res.status(404).json({body: `sheet with id ${req.params.id} not found`})
    if(sheet.owner != req.userId)
        return res.status(403).json(`user ${req.userId} does not have permission to edit this sheet`)
    
    DeathInSpaceSheet.findByIdAndUpdate(req.params.id, req.body, {returnDocument: 'after', runValidators:true}).then(result => {
        return res.json(result)
    }).catch(err => {
        return res.status(400).json(err)
    })
})

export default disRouter