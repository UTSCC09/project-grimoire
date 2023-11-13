import { Router } from "express";
import { isAuthenticated, rollNSidedDie, randomNumberBetween, removeSpacesFromQuery } from "../helper.mjs";
import mongoose, {isValidObjectId, mongo} from 'mongoose'
import { DEFAULTLIMIT, DEFAULTPAGE } from "../app.mjs";
import { Game, User, UserSheetMapping } from "../schemas.mjs";
import { MHMoves, MHSkin, MonsterHeartSheet } from "./schema.mjs";

export const MHRouter = new Router()
/**
 * finds all monster hearts skins
 * @param {Number} page page of pagination that we're on
 * @param {Number} limit limit of pagination
 * @param {Object} query the query object itself is used as our search parameters, excluding the page and limit
 * @returns {Object} list of skins, and info involving pagination
 */
MHRouter.get('/skins', (req, res, next) => {
    const page = req.query.page || DEFAULTPAGE
    const limit = req.query.limit || DEFAULTLIMIT

    const searchParams = removeSpacesFromQuery(req.query)
    delete searchParams.page
    delete searchParams.limit

    MHSkin.find(searchParams, null, {skip: page * limit, limit:limit+1, sort: {name: -1}}).exec()
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
 * finds all monster hearts moves
 * @param {Number} page page of pagination that we're on
 * @param {Number} limit limit of pagination
 * @param {Object} query the query object itself is used as our search parameters, excluding the page and limit
 * @returns {Object} list of moves, and info involving pagination
 */
MHRouter.get('/moves', (req, res, next) => {
    const page = req.query.page || DEFAULTPAGE
    const limit = req.query.limit || DEFAULTLIMIT

    const searchParams = removeSpacesFromQuery(req.query)
    delete searchParams.page
    delete searchParams.limit

    MHSkin.find(searchParams, null, {skip: page * limit, limit:limit+1, sort: {name: -1}}).exec()
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

MHRouter.post("/sheets/create", isAuthenticated, async (req, res ,next) => {
    const json = req.body

    //find monster heart skin to get appropriate skill options
    const monsterHearts = await Game.findOne({name: "Monster Hearts"}).exec()
    if(!monsterHearts)
        return res.status(500).json({body: "this game couldn't be found in our database"})
    //query moves and skins
    const skins =MHSkin.findById(json.skin).exec()
    const moves = MHMoves.find({_id: {$in: json.moves}}).exec()
    Promise.all([skins, moves]).then(async ([skin, moveArray]) => {
        if(!skin)
            return res.status(404).json({body: `skin with id ${json.skinId} not found`})

        if(!(typeof(json.statOption) === 'number' && json.statOption < skin.statOptions.length)){
            console.log('statOptions.length', skin.statOptions.length)
            console.log('number', json.statOption instanceof Number)
            return res.status(400).json({body: "statOption invalid"})
        }

        if(moveArray.length != json.moves.length)
            return res.status(400).json({body: "moves contains invalid id"})

        const statObj = skin.statOptions[json.statOption]
        const MHSheet = new MonsterHeartSheet({
            characterName: json.name,
            owner: req.userId,
            game: monsterHearts._id,
            skin: skin._id,
            stats: statObj,
            strings: json.strings,
            look: json.look,
            origin: json.origin,
            eyes: json.eyes,
            inventory: json.inventory,
            notes: json.notes,
            moves: [...new Set([...moveArray.map(m => m._id.toString()), ...skin.requiredMoves.map((move) => move.toString())])]
        })
        const errors = MHSheet.validateSync()
        if(errors && errors.errors.length > 0){
            console.error('erros',errors)
            return res.status(403).json({errors: errors.errors})
        }

        //starting a transaction to make sure both sheets get saved
        const session = await mongoose.startSession();
        session.startTransaction();
        MHSheet.save().then((saved) => {
            //creating the user-game-sheet mapping
            const mapping = new UserSheetMapping({
                game: saved.game,
                user: saved.owner,
                sheet: saved._id,
                sheetModel: "MHSheet"
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
})

MHRouter.patch('/sheets/:id', (req, res, next) => {

})