import { Router } from "express"
import multer from "multer"
import { Game } from "../schemas.mjs"
import { resolve, join } from "path";
import { DEFAULTPAGE, DEFAULTLIMIT } from "../app.mjs";
import { removeSpacesFromQuery, mongoLikeString } from "../helper.mjs";
import { isValidObjectId } from "mongoose";

const imageUpload = multer({dest: resolve("staticAssets/gameBanners")})

export const gamesRouter = new Router()
let numGames

gamesRouter.get('/', async (req, res, next) => {
    const page = Number(req.query.page) || DEFAULTPAGE
    const limit = Number(req.query.limit) || DEFAULTLIMIT

    //check if we have number of games; shouldn't change unless newly deployed app
    if(!numGames){
        //get number of games and set it, not using memcache because unessecary and pain with nginx
        numGames = await Game.countDocuments({})
    }

    //check if we have number of games; shouldn't change unless newly deployed app
    if(!numGames){
        //get number of games and set it, not using memcache because unessecary and pain with nginx
        numGames = await Game.countDocuments({})
    }

    const searchParams = removeSpacesFromQuery(req.query)
    delete searchParams.page
    delete searchParams.limit
    if(searchParams.name)
        searchParams.name = mongoLikeString(searchParams.name)
    Game.find(searchParams, null, {skip: page * limit, limit:limit, sort: {name: 1}}).exec()
    .then((docs) => {
        return res.status(200).json({records: docs, numGames:numGames})
    }).catch(e => next(e))
})

gamesRouter.get("/:id/pic", (req, res, next) => {
    const id = req.params.id
    if(!isValidObjectId(id))
        return res.status(422).json(id)

    Game.findById(id).exec().then((doc) => {
        const img = doc.banner
        const dirname = resolve()
        if(img){    
            res.setHeader("Content-Type", img.mimetype);
            res.sendFile(join(dirname, img.path));
        }else{
            res.status(404).send({body: `Banner does not exist for game ${req.params.id}`})
        }
    }).catch(e => next(e))
})

// gamesRouter.post('/:id/pic', imageUpload.single('image'), (req, res, next)=>{
//     if(!req.file)
//         return res.status(422).json({body: "missing image"})
//     console.log('file', req.file)
//     console.log('id', req.params.id)
//     Game.findById(req.params.id).exec().then(async (doc)=>{
//         if(!doc)
//             return res.status(404).json({body: "game not found"})
//         try{
//             doc.banner = req.file
//             const result = await doc.save()
//             return res.json(result)
//         }catch(e){
//             return next(e)
//         }
//     }).catch(e => {
//         next(e)
//     })
// })