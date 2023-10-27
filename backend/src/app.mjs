import { createServer } from "http";
import express from "express";
import session from "express-session";
import dotenv from 'dotenv';
import mongoose, {mongo} from 'mongoose'
import { Game, User, UserSheetMapping } from "./schemas.mjs";
import { compare } from "bcrypt";
import {saltHashPassword, isAuthenticated } from "./helper.mjs";
import mongoSanitize from "express-mongo-sanitize"
import disRouter from "./deathInSpace/routes.mjs";
import { DeathInSpaceSheet } from "./deathInSpace/schema.mjs";

dotenv.config();

const PORT = 8000;
await mongoose.connect(process.env.MONGO_URL)

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
app.get("/api/sheet/:id", async (req, res, next) => {
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
app.delete('/api/sheet/:id', isAuthenticated, async (req, res, next) => {
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