import { Router } from "express";
import { isAuthenticated, rollNSidedDie, randomNumberBetween } from "../helper.mjs";
import mongoose, {isValidObjectId, mongo} from 'mongoose'
import { DEFAULTLIMIT, DEFAULTPAGE } from "../app.mjs";
import { Game, User, UserSheetMapping } from "../schemas.mjs";
import { MHMoves, MHSkin } from "./schema.mjs";

export const MHRouter = new Router()
/**
 * finds all monster hearts skins
 * @param {Number} page page of pagination that we're on
 * @param {Number} limit limit of pagination
 * @returns {Array[Object]} list of skins
 */
MHRouter.get('/skins', (req, res, next) => {
    const page = req.query.page || DEFAULTPAGE
    const limit = req.query.limit || DEFAULTLIMIT

    MHSkin.find({}, null, {skip: page * limit, limit:limit, sort: {name: -1}}).populate(['requiredMoves']).exec()
    .then((docs) => {
        return res.json(docs)
    }).catch(err => {
        next(err)
    })
})

MHRouter.get('/moves', (req, res, next) => {
    const page = req.query.page || DEFAULTPAGE
    const limit = req.query.limit || DEFAULTLIMIT

    MHMoves.find({}, null, {skip: page * limit, limit:limit, sort: {name: -1}}).exec()
    .then((docs) => {
        return res.json(docs)
    }).catch(err => {
        next(err)
    })
})