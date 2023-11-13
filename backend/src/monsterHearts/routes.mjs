import { Router } from "express";
import { isAuthenticated, rollNSidedDie, randomNumberBetween, removeSpacesFromQuery } from "../helper.mjs";
import mongoose, {isValidObjectId, mongo} from 'mongoose'
import { DEFAULTLIMIT, DEFAULTPAGE } from "../app.mjs";
import { Game, User, UserSheetMapping } from "../schemas.mjs";
import { MHMoves, MHSkin } from "./schema.mjs";

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