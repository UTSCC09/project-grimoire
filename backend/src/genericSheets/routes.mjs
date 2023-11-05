import { Router } from "express";
import { isAuthenticated } from "../helper.mjs";
import { Game, User, UserSheetMapping } from "../schemas.mjs";
import mongoose, {isValidObjectId, mongo} from 'mongoose'
import multer, {MulterError} from 'multer'
import { resolve } from "path";
import { DEFAULTLIMIT, DEFAULTPAGE } from "../app.mjs";

const sheetRouter = Router()

//creating multer functionality for uploading character portraits, max size is 50mb
const MAXPORTRAITSIZE = 52428800 //50MB
const sheetPortraitUpload = multer({dest: resolve("uploads/characterPortraits"), limits: {fileSize : MAXPORTRAITSIZE},
fileFilter: function(req, file, cb){s
    if((file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/gif" || file.mimetype == 'image/png')){
          //correct format
          return cb(null, true);
     } else{ 
          //wrong format
          return cb(null, false);
     }}})

/**
 * gets list of all character sheets belonging to current logged in user
 * @param {Number} page what page of pagination (default 0)
 * @param {Number} limit limit of number of docs per page (default 10)
 * 
 * @returns {Array[Object]} returns array of character sheets, excluding their subdocuments
 */
sheetRouter.get("/", isAuthenticated, async (req, res, next) => {
    const page = req.query.page || DEFAULTPAGE
    const limit = req.query.limit || DEFAULTLIMIT

    UserSheetMapping.find({user: req.userId}, null, {skip: page * limit, limit: limit, sort: {createdOn: 1}})
    .populate(['sheet', 'game']).exec()
    .then(sheets => {
        return res.json({sheets})
    }).catch((err) => {
        return res.status(500).json({err})
    })
})

/**
 * gets character sheet, irrespective of game, having corresponding id. 
 * not dependent on user signing in in case they want to share their sheet with others
 * 
 * @param {String} id id of the character sheet
 * @returns {Object} the character sheet with the given id
 */
sheetRouter.get("/:id", async (req, res, next) => {
    if(!isValidObjectId(req.params.id))
        return res.status(400).json({body: "invalid object id"})
    UserSheetMapping.findOne({sheet: req.params.id}).exec()
    .then(async (mapping) => {
        if(!mapping)
            return res.status(404).json({body: `sheet with id ${req.params.id} not found`})
        const tempModel = new mongoose.model(mapping.sheetModel)
        //using decalred schema method to find and populate all nessecary fields
        //after dynamically getting correct model
        const charSheet = await tempModel.findById(mapping.sheet).populate(new tempModel().getPopulationFields() || [])
        return res.json(charSheet)
    }).catch(err => {console.error(err); res.status(400).json(err)})
})


/**
 * deletes a character sheet with given id belonging to user, irrespective of game
 * 
 * @param {String} id of the character sheet to be deleted
 */
sheetRouter.delete('/:id', isAuthenticated, async (req, res, next) => {
    if(!isValidObjectId(req.params.id))
        return res.status(400).json({body: "invalid object id"})
    const session = await mongoose.startSession()
    session.startTransaction()
    UserSheetMapping.findOne({sheet: req.params.id}).exec()
    .then((mapping) => {
        if(!mapping)
            return res.status(404).json({body: `sheet with id ${req.params.id} not found`})
        if(req.userId != mapping.user.toString()){
            return res.status(403).json({body: "user doesn't have permission to delete given sheet"})
        }
        const tempModel = new mongoose.model(mapping.sheetModel)
        return tempModel.deleteOne({_id: mapping.sheet})
        .then(async() => {
            await UserSheetMapping.deleteOne({_id: mapping._id})
            session.commitTransaction()
            session.endSession()
            return res.json({body: `sheet ${mapping.sheet} deleted`})
        }).catch(err => {
            session.abortTransaction()
            session.endSession()
            res.status(400).json(err.errors)    
        })
    }).catch(err => {
        session.abortTransaction()
        session.endSession()
        console.error(err)
        res.status(400).json(err.errors)})
})

//endpoint where, if a sheet has a picture field, will upload a picture
//again, provided proper mapping
/**
 * adds picture to character sheet with given id, if it has a characterPortrait field
 * 
 * @param {String} id id of character sheet in question
 * @param {File} image image that will be uploaded the the sheet
 */
sheetRouter.post('/:id/pic', isAuthenticated, async(req, res, next) => {
    if(!isValidObjectId(req.params.id))
        return res.status(400).json({body: "invalid object id"})
    const mapping = await UserSheetMapping.findOne({sheet: req.params.id}).exec()
    if(!mapping)
        return res.status(404).json({body: `sheet with id ${req.params.id} not found`})

    if(mapping.user != req.userId)
        return res.status(403).json({body: `user ${req.userId} does not have permission for this sheet`})

    const up = sheetPortraitUpload.single('image')
    up(req, res, err => {
        if(err instanceof MulterError){
            if(err.message === 'File too large')
                return res.status(422).json({body: "file too large"})
            throw err
        }
        if(!req.file)
            return res.status(422).json({body: "missing image"})
        const tempModel = new mongoose.model(mapping.sheetModel)
        tempModel.findOneAndUpdate({_id: mapping.sheet}, {characterPortrait: req.file}, 
            {returnDocument: 'after', runValidators:true}).then((doc) => {
            return res.status(201).json({body: "image successfully uploaded"})
        }).catch(err => {
            console.log('errors', err)
            return res.status(400).json({errors: err})
        })
    })
})

/**
 * retrieves character portrait of sheet with given id, if it exists
 * 
 * @param {String} id id of charactersheet
 * @returns {File} image corresponding to charactersheet, if it exists
 */
sheetRouter.get('/:id/pic', async (req, res, next) => {
    if(!isValidObjectId(req.params.id))
        return res.status(400).json({body: "invalid object id"})
    const sheetId = req.params.id

    if(!sheetId){
        res.status(422).json({body: "missing sheet: id"})
        return
    }

    const mapping = await UserSheetMapping.findOne({sheet: req.params.id}).exec()
    if(!mapping)
        return res.status(404).json({body: `sheet with id ${req.params.id} not found`})

    const tempModel = new mongoose.model(mapping.sheetModel)
    tempModel.findById(sheetId).exec().then((doc) => {
        const img = doc.characterPortrait
        if(img){    
            res.setHeader("Content-Type", img.mimetype);
            res.sendFile(resolve(img.path));
        }else{
            res.status(404).send({body: `charactrPotrait does not exist for sheet ${req.params.id}`})
        }
    }).catch(err => {
        res.status(500).json(err)
    })
})

export default sheetRouter