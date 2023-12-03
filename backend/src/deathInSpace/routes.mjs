import { Router } from "express";
import { isAuthenticated, rollNSidedDie, randomNumberBetween, mongoLikeString } from "../helper.mjs";
import { DISArmor, DISInventoryItem, DISMutation, DISOrigin, DISStartingEquipment, DISWeapon, DeathInSpaceSheet } from "./schema.mjs";
import { Game, User, UserSheetMapping } from "../schemas.mjs";
import { addStartingBonus, addStartingEquip } from "./sheets.mjs";
import mongoose, {isValidObjectId, mongo} from 'mongoose'
import { DEFAULTLIMIT, DEFAULTPAGE } from "../app.mjs";
import { removeSpacesFromQuery } from "../helper.mjs";

const disRouter = Router()

/**
 * gets death in space origins lining up with given pagination
 * 
 * @param {Number} page page that we want to paginate to
 * @param {Number} limit number of elements per page
 * @param {Object} query the query object itself is used as our search parameters, excluding the page and limit
 * 
 * @returns {Object} an array of origins, and info involving pagination
 */
disRouter.get('/origins', async (req, res, next) => {
    const page = Number(req.query.page) || DEFAULTPAGE
    const limit = Number(req.query.limit) || DEFAULTLIMIT

    const searchParams = removeSpacesFromQuery(req.query)
    delete searchParams.page
    delete searchParams.limit
    if(searchParams.name)
        searchParams.name = mongoLikeString(searchParams.name)

    DISOrigin.find(searchParams, null, {skip: page * limit, limit:limit+1, sort: {name: 1}}).exec()
    .then((docs) => {
        let nextPageExists = false
        if(docs.length > limit){
            nextPageExists = docs.length > limit
            docs.pop()
        }
        return res.json({records: docs, nextPageExists:nextPageExists, prevPageExists: page > 0})
    }).catch(err => {
        next(err)
    })
})

/**
 * gets death in space mutations lining up with given pagination
 * 
 * @param {Number} page page that we want to paginate to
 * @param {Number} limit number of elements per page
 * @param {Object} query the query object itself is used as our search parameters, excluding the page and limit
 * 
 * @returns {Object} an array of records, and info involving pagination
 */
disRouter.get('/mutations', async (req, res, next) => {
    const page = Number(req.query.page) || DEFAULTPAGE
    const limit = Number(req.query.limit) || DEFAULTLIMIT

    const searchParams = removeSpacesFromQuery(req.query)
    delete searchParams.page
    delete searchParams.limit
    if(searchParams.name)
        searchParams.name = mongoLikeString(searchParams.name)

    DISMutation.find(searchParams, null, {skip: page * limit, limit:limit+1, sort: {name: 1}}).exec()
    .then((docs) => {
        let nextPageExists = false
        if(docs.length > limit){
            nextPageExists = docs.length > limit
            docs.pop()
        }
        return res.json({records: docs, nextPageExists:nextPageExists, prevPageExists: page > 0})
    }).catch(err => {
        next(err)
    })
})

/**
 * gets death in space items lining up with given pagination
 * 
 * @param {Number} page page that we want to paginate to
 * @param {Number} limit number of elements per page
 * @param {Object} query the query object itself is used as our search parameters, excluding the page and limit
 * 
 * @returns {Object} an array of records, and info involving pagination
 */
disRouter.get('/items', async (req, res, next) => {
    const page = Number(req.query.page) || DEFAULTPAGE
    const limit = Number(req.query.limit) || DEFAULTLIMIT

    const searchParams = removeSpacesFromQuery(req.query)
    delete searchParams.page
    delete searchParams.limit
    if(searchParams.name)
        searchParams.name = mongoLikeString(searchParams.name)

    DISInventoryItem.find(searchParams, null, {skip: page * limit, limit:limit+1, sort: {name: 1}}).exec()
    .then((docs) => {
        let nextPageExists = false
        if(docs.length > limit){
            nextPageExists = docs.length > limit
            docs.pop()
        }
        return res.json({records: docs, nextPageExists:nextPageExists, prevPageExists: page > 0})
    }).catch(err => {
        next(err)
    })
    
})

/**
 * gets death in space weapons lining up with given pagination
 * 
 * @param {Number} page page that we want to paginate to
 * @param {Number} limit number of elements per page
 * @param {Object} query the query object itself is used as our search parameters, excluding the page and limit
 * 
 * @returns {Object} an array of records, and info involving pagination
 */
disRouter.get('/weapons', async (req, res, next) => {
    const page = Number(req.query.page) || DEFAULTPAGE
    const limit = Number(req.query.limit) || DEFAULTLIMIT

    const searchParams = removeSpacesFromQuery(req.query)
    delete searchParams.page
    delete searchParams.limit
    if(searchParams.name)
        searchParams.name = mongoLikeString(searchParams.name)
    if(searchParams.type)
        searchParams.type = mongoLikeString(searchParams.type)

    DISWeapon.find(searchParams, null, {skip: page * limit, limit:limit+1, sort: {name: 1}}).exec()
    .then((docs) => {
        let nextPageExists = false
        if(docs.length > limit){
            nextPageExists = docs.length > limit
            docs.pop()
        }
        return res.json({records: docs, nextPageExists:nextPageExists, prevPageExists: page > 0})
    }).catch(err => {
        next(err)
    })
})

/**
 * gets death in space armor lining up with given pagination
 * 
 * @param {Number} page page that we want to paginate to
 * @param {Number} limit number of elements per page
 * @param {Object} query the query object itself is used as our search parameters, excluding the page and limit
 * 
 * @returns {Object} an array of records, and info involving pagination
 */
disRouter.get('/armor', async (req, res, next) => {
    const page = Number(req.query.page) || DEFAULTPAGE
    const limit = Number(req.query.limit) || DEFAULTLIMIT

    const searchParams = removeSpacesFromQuery(req.query)
    delete searchParams.page
    delete searchParams.limit
    if(searchParams.name)
        searchParams.name = mongoLikeString(searchParams.name)
    if(searchParams.type)
        searchParams.type = mongoLikeString(searchParams.type)

    DISArmor.find(searchParams, null, {skip: page * limit, limit:limit+1, sort: {name: 1}}).exec()
    .then((docs) => {
        let nextPageExists = false
        if(docs.length > limit){
            nextPageExists = docs.length > limit
            docs.pop()
        }
        return res.json({records: docs, nextPageExists:nextPageExists, prevPageExists: page > 0})
    }).catch(err => {
        next(err)
    })
})

/**
 * gets death in space starting equipment lining up with given pagination
 * 
 * @param {Number} page page that we want to paginate to
 * @param {Number} limit number of elements per page
 * @param {Object} query the query object itself is used as our search parameters, excluding the page and limit
 * 
 * @returns {Object} an array of records, and info involving pagination
 */
disRouter.get('/startequip', async (req, res, next) => {
    const page = Number(req.query.page) || DEFAULTPAGE
    const limit = Number(req.query.limit) || DEFAULTLIMIT

    const searchParams = removeSpacesFromQuery(req.query)
    delete searchParams.page
    delete searchParams.limit
    if(searchParams.name)
        searchParams.name = mongoLikeString(searchParams.name)

    DISStartingEquipment.find(searchParams, null, {skip: page * limit, limit:limit+1, sort: {name: 1}}).exec()
    .then((docs) => {
        let nextPageExists = false
        if(docs.length > limit){
            nextPageExists = docs.length > limit
            docs.pop()
        }
        return res.json({records: docs, nextPageExists:nextPageExists, prevPageExists: page > 0})
    }).catch(err => {
        next(err)
    })
})

/**
 * creates a fully randomized Death In space charactersheet, with logged in user as owner
 * 
 * @returns {Object} the randomized character sheet created for the user
 */
disRouter.post("/sheets/random", isAuthenticated, async (req, res, next) => {

    let json = req.body
    if(!json.characterName){
        return res.status(400).json({body: "missing name"})
    }

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
        characterName: json.characterName,

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
            .then(() => res.status(201).json(saved))
        }).catch(async (err) => {
            session.abortTransaction()
            .then(() => session.endSession())
            .then(() => res.status(400).json({errors: err}))
        })
    }).catch(err => {
        if(err.name === "ValidationError"){
            return res.status(400).json({error: err.errors})
        }
        return next(err)
    })
})

disRouter.get('/randomBonus', (req, res, next) => {
    const sheet = {
        mutations: [],
        armor: [],
        weapons: [],
        inventory: [],
        hitPoints: 0
    }
    addStartingBonus(sheet, true)
    .then((newSheet) =>  res.json(newSheet))
    .catch(e => next(e))
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
disRouter.post("/sheets/create", isAuthenticated, async(req, res, next) => {
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
        characterName: json.characterName,
        stats: stats,
        inventory: json.inventory,
        weapons: json.weapons,
        armor: json.armor,
        background: json.background,
        drive: json.drive,
        looks: json.looks,
        pastAllegiance: json.pastAllegiance,
        holos: json.holos,
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
        console.error('erros',errors)
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
            return res.status(201).json(saved)
        }).catch(async (err) => {
            await session.abortTransaction()
            await session.endSession()
            throw err
        })
    }).catch(err => {
        if(err.name === "ValidationError"){
            return res.status(403).json({error: err.errors})
        }
        return next(err)
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
disRouter.patch('/sheets/:id', isAuthenticated, async (req, res, next) => {
    if(!isValidObjectId(req.params.id))
        return res.status(400).json({body: "invalid object id"})
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


/**
 * the following are meant for testing purposes
 */
export function getDISSheets(){
    return DeathInSpaceSheet.find({}).exec()
}