import { Router } from "express";
import { isAuthenticated } from "../helper.mjs";
import { User } from "../schemas.mjs";
import { Group } from "../groups/schema.mjs";
import multer, {MulterError} from 'multer'
import { resolve } from "path";
import fs from 'fs'

export const UserRouter = new Router()

const MAXPORTRAITSIZE = 52428800 //50MB
const sheetPortraitUpload = multer({dest: resolve("uploads/profilePictures"), limits: {fileSize : MAXPORTRAITSIZE},
fileFilter: function(req, file, cb){
    if((file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/gif" || file.mimetype == 'image/png')){
          //correct format
          return cb(null, true);
     } else{ 
          //wrong format
          return cb(null, false);
     }}})

UserRouter.get('/currUser', isAuthenticated, async (req, res, next) => {
    const uPromise = User.findById(req.userId, {password: 0, salt: 0}).exec()
    const uGroups = Group.find({members: {$in: [req.userId]}}).exec()

    Promise.all([uPromise, uGroups]).then(([user, groups]) => {
        user = user.toObject()
        user.groups = groups
        return res.status(200).json(user)
    }).catch(e => next(e))
})

UserRouter.put('/:id/pic', isAuthenticated, async (req, res ,next) => {
    if(req.params.id !== req.userId)
        return res.status(403).json({body: `Do not have permission to edit user ${req.params.id}`})
    const user = await User.findById(req.userId).exec()
    if(!user)
        return res.status(404).json({body: "User with corresponding ID not found"})

    console.log('test', req.body)
    
    const up = sheetPortraitUpload.single('image')
    up(req, res, err => {
        if(err instanceof MulterError){
            if(err.message === 'File too large')
                return res.status(422).json({body: "file too large"})
            return next(err)
        }
        if(!req.file)
            return res.status(422).json({body: "missing image"})

        //delete previous profile picture, if it exists
        if(user.profilePicture && user.profilePicture.path){
            fs.unlink(user.profilePicture.path, (fserr) => {
                if(fserr && fserr.code !== 'ENOENT')
                    return next(err)

                User.findOneAndUpdate({_id: req.userId}, {profilePicture: req.file}, 
                    {returnDocument: 'after', runValidators:true}).then((doc) => {
                    return res.status(201).json({body: "image successfully uploaded"})
                }).catch(err => {
                    console.log('errors', err)
                    return res.status(400).json({errors: err})
                })
            })
        }else{
            User.findOneAndUpdate({_id: req.userId}, {profilePicture: req.file}, 
                {returnDocument: 'after', runValidators:true}).then((doc) => {
                return res.status(201).json({body: "image successfully uploaded"})
            }).catch(err => {
                console.log('errors', err)
                return res.status(400).json({errors: err})
            })
        }
    })
})

UserRouter.get('/:id/pic', async (req, res, err) => {
    User.findById(req.params.id).exec().then((doc) => {
        if(!doc)
            return res.status(404).json({body: 'given User does not exist'})
        const img = doc.profilePicture
        if(img){    
            res.setHeader("Content-Type", img.mimetype);
            res.sendFile(resolve(img.path));
        }else{
            res.status(404).send({body: `profile picture does not exist for sheet ${req.params.id}`})
        }
    })
})