import { Router } from "express"
import multer from "multer"
import { Game } from "../schemas.mjs"
import { resolve } from "path";
import { DEFAULTPAGE, DEFAULTLIMIT } from "../app.mjs";
import { removeSpacesFromQuery, mongoLikeString } from "../helper.mjs";
import { isValidObjectId } from "mongoose";

const imageUpload = multer({dest: resolve("staticAssets/gameBanners")})

export const gamesRouter = new Router()

gamesRouter.get('/', (req, res, next) => {
    const page = req.query.page || DEFAULTPAGE
    const limit = req.query.limit || DEFAULTLIMIT

    const searchParams = removeSpacesFromQuery(req.query)
    delete searchParams.page
    delete searchParams.limit
    if(searchParams.name)
        searchParams.name = mongoLikeString(searchParams.name)
    Game.find(searchParams, null, {skip: page * limit, limit:limit+1, sort: {name: 1}}).exec()
    .then((docs) => {
        let nextPageExists = false
        if(docs.length > limit){
            nextPageExists = true
            docs.pop()
        }
        return res.status(200).json({records: docs, nextPageExists:nextPageExists, prevPageExists: page > 0})
    }).catch(e => next(e))
})

gamesRouter.get("/:id/pic", (req, res, next) => {
    const id = req.params.id
    if(!isValidObjectId(id))
        return res.status(422).json(id)

    Game.findById(id).exec().then((doc) => {
        const img = doc.banner
        if(img){    
            res.setHeader("Content-Type", img.mimetype);
            res.sendFile(resolve(img.path));
        }else{
            res.status(404).send({body: `charactrPotrait does not exist for sheet ${req.params.id}`})
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