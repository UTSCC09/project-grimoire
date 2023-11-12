import { Router } from "express";
import { getLocalGames, testGeocode } from "./gMaps.mjs";

export const MapsRouter = new Router()

/**
 * gets local game stores within a radius of x of given params
 * 
 * @param {Number} longitutde the longitude of the user
 * @param {Number} latitude the latitude of th use
 */
MapsRouter.get('/localStores', (req, res, next) => {
    const obj = req.query
    getLocalGames(obj.lat, obj.lng, obj.radius)
    .then(r => {
        res.json(r.data.results)
    })
    .catch(e => {
        next(e)
    });
})

MapsRouter.get('/test', (req, res, next) => {
    testGeocode()
    .then(resp => res.json(resp.data.results))
    .catch(e => {
        next(e)
    })
})