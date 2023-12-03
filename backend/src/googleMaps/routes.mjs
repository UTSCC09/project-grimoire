import { Router } from "express";
import { formatReverseGeocode, getLocalGames, reverseGeocode } from "./gMaps.mjs";

export const MapsRouter = new Router()

/**
 * gets local game stores within a radius of x of given params
 * 
 * @param {Number} longitutde the longitude of the user
 * @param {Number} latitude the latitude of th use
 */
MapsRouter.get('/localStores', (req, res, next) => {
    const obj = req.query
    if(!(obj.lat && obj.lng))
        return res.status(400).json({body: "Need lat and lng values"})
    getLocalGames(obj.lat, obj.lng, obj.radius)
    .then(r => {
        return res.json(r.data.results)
    })
    .catch(e => {
        next(e)
    });
})

MapsRouter.get('/reverseGeocode', (req, res, next) => {
    const obj = req.query
    if(!(obj.lat && obj.lng))
        return res.status(400).json({body: "Need lat and lng values"})
    reverseGeocode(obj.lat, obj.lng)
    .then(r => {
        return res.json(formatReverseGeocode(r.data.results))
    }).catch(e => {
        next(e)
    })
})