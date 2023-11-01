import { createServer } from "http";
import express from "express";
import session from "express-session";
import dotenv from 'dotenv';
import mongoose, {mongo} from 'mongoose'
import { Game, User, Group, UserSheetMapping } from "./schemas.mjs";
import { compare } from "bcrypt";
import {saltHashPassword, isAuthenticated } from "./helper.mjs";
import mongoSanitize from "express-mongo-sanitize"
import disRouter from "./deathInSpace/routes.mjs";
import multer, {MulterError} from 'multer'
import { resolve } from "path";

dotenv.config();

const PORT = 8000;
await mongoose.connect(process.env.MONGO_URL)

const MAXPORTRAITSIZE = 52428800 //50MB
const sheetPortraitUpload = multer({dest: resolve("uploads/characterPortraits"), limits: {fileSize : MAXPORTRAITSIZE},
fileFilter: function(req, file, cb){
    if((file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/gif" || file.mimetype == 'image/png')){
          //correct format
          return cb(null, true);
     } else{ 
          //wrong format
          return cb(null, false);
     }}})

const app = express();

app.use(express.json())
app.use(mongoSanitize())

app.use(
    session({
      secret: process.env.SESSION_KEY,
      resave: false,
      saveUninitialized: true,
    })
);

app.use(function (req, res, next) {
    req.user = req.session.user ? req.session.user : null
    req.userId = req.session.userId ? req.session.userId : null
    console.log("HTTP request", req.user, req.method, req.url, req.body);
    next();
});

app.use('/api/sheets/dis', disRouter)

app.get("/", (req, res, next) => {
    return res.json({body: "This is the grimoire backend :D"})
})

//gets charactersheet regardless of game, provided that it has been linked
//to UserSheetMappings and its schema has properly implemented getPopulationFields
app.get("/api/sheets/:id", async (req, res, next) => {
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


//endpoint that will delete any character sheet, so long as its mapping
//is properly set up
app.delete('/api/sheets/:id', isAuthenticated, async (req, res, next) => {
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
            await UserSheetMapping.deleteOne(mapping._id)
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
        res.status(400).json(err.errors)})
})

//endpoint where, if a sheet has a picture field, will upload a picture
//again, provided proper mapping
app.post('/api/sheets/:id/pic', isAuthenticated, async(req, res, next) => {
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

app.get('/api/sheets/:id/pic', async (req, res, next) => {
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
        res.setHeader("Content-Type", img.mimetype);
        res.sendFile(resolve(img.path));
    }).catch(err => {
        res.status(500).json(err)
    })
})

// Looking for group endpoints

// endpoint to add a new game group
// requires a group name, game name, and owner is the user who created the group
app.post('/api/groups', isAuthenticated, async (req, res, next) => {
    const json = req.body;
    const owner = await User.findById(req.userId).exec();
    if(!json.name){
        return res.status(400).json({body: "Missing group: name"})
    }
    if(!json.game){
        return res.status(400).json({body: "Missing group: game"})
    }
    if(!owner){
        return res.status(404).json({body: `user with id ${req.userId} not found`})
    }
    const group = new Group({
        name: json.name,
        owner: owner,
        game: json.game
    });
    group.save().then((saved) => {
        return res.status(201).json({saved})
    }).catch((err) => {
        res.status(500).json({errors: err})
    })
})

// endpoint to join a game group as a member
app.post('/api/groups/:id/join', isAuthenticated, async (req, res, next) => {
    const id = req.params.id
    const user = req.userId
    if(!id){
        res.status(422).json({body: "missing group: id"})
        return
    }
    const model = await Group.findById(id).exec()
    if(!model){
        res.status(404).json({body: `group with id ${id} not found`})
        return
    }
    if(model.members.includes(user)){
        res.status(409).json({body: `user ${user} already in group ${id}`})
        return
    }
    model.members.push(user)
    model.save().then((doc) => {
        res.status(201).json(doc)
    }).catch(err => {
        res.status(500).json({errors: err})
    })
})

// endpoint to leave a game group as a member
app.post('/api/groups/:id/leave', isAuthenticated, async (req, res, next) => {
    const id = req.params.id
    const user = req.userId
    if(!id){
        res.status(422).json({body: "missing group: id"})
        return
    }
    const model = await Group.findById(id).exec()
    if(!model){
        res.status(404).json({body: `group with id ${id} not found`})
        return
    }
    if(!model.members.includes(user)){
        res.status(409).json({body: `user ${user} not in group ${id}`})
        return
    }
    model.members = model.members.filter((member) => member != user)
    model.save().then((doc) => {
        res.status(201).json(doc)
    }).catch(err => {
        res.status(500).json({errors: err})
    })
})

// endpoint to get all game groups
app.get('/api/groups', async (req, res, next) => {
    const model = await Group.find({}).exec()
    res.status(200).json(model)
})

// endpoint to get all game groups owned by a specific user
app.get('/api/groups/user/:id', async (req, res, next) => {
    const id = req.params.id
    if(!id){
        res.status(422).json({body: "missing user: id"})
        return
    }
    const model = await Group.find({owner: id}).exec()
    res.status(200).json(model)
})

// endpoint to get paginated list of game groups given page number and page size
app.get('/api/groups/page/', async (req, res, next) => {
    const page = req.query.page
    const size = req.query.size
    if(!page){
        res.status(422).json({body: "missing page number"})
        return
    }
    if(!size){
        res.status(422).json({body: "missing page size"})
        return
    }
    const model = await Group.find({}).skip(page * size).limit(size).exec()
    res.status(200).json(model)
})

// endpoint to get a specific game group
app.get('/api/groups/:id', async (req, res, next) => {
    const id = req.params.id
    if(!id){
        res.status(422).json({body: "missing group: id"})
        return
    }
    const model = await Group.findById(id).exec()
    if(!model){
        res.status(404).json({body: `group with id ${id} not found`})
        return
    }
    res.status(200).json(model)
})

app.post('/api/signup', async (req, res, next) => {
    const json = req.body
    if(!json.username){
        return res.status(400).json({body: "Missing user: id"})
    }
    if(!json.password){
        return res.status(400).json({body: "Missing user: password"})
    }

    User.findOne({username: json.username}).exec().then((sameUser) => {
        if(sameUser){
            return res.status(409).json({body:  "username " + json.username + " already exists"});
        }
    
        saltHashPassword(json.password).then(async ([hash, salt])=> {
            const user = new User({
                username: json.username,
                password: hash,
                salt: salt
            }) 
            const newUser = await user.save()
            req.session.user = newUser.username
            req.session.userId = newUser._id
            res.status(201).json({username: user.username})
        }).catch((err) => {
            res.status(500).json({errors: err})
        })
    })
})

app.post("/api/signin", (req, res, next) => {
    const username = req.body.username
    const password = req.body.password
    User.findOne({username:username}).exec().then((doc) => {
        if(!doc)
            return res.status(404).json({body: `User with username ${username} not found`})

        compare(password, doc.password).then(result =>  {
            // result is true is the password matches the salted hash from the database
            if (!result) return res.status(401).json({body: "access denied"});
            //write username into session
            req.session.user = username;
            req.session.userId = doc._id
            return res.json(username);
        });
    }).catch(err => {
        return res.status(400).json({errors: err})
    })

})

app.post('/api/signout', (req, res, next) => {
    req.session.destroy((err) => {
        res.status(200).json({body: "logout successful"})
    })
})

//BASIC API TO GET TEST CLASSES FROM DB
app.get('/user', async (req, res, next) => {
    const models = await User.find({})
    res.status(200).json(models)
})

export const server = createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});