import { createServer } from "http";
import express, { urlencoded } from "express";
import session from "express-session";
import dotenv from 'dotenv';
import mongoose, {mongo} from 'mongoose'
import { DISMutation, DISOrigin, DeathInSpaceSheet } from "./deathInSpace/schema.mjs";
import { Game, User, UserSheetMapping } from "./schemas.mjs";
import { compare } from "bcrypt";
import { randomNumberBetween, rollNSidedDie, saltHashPassword } from "./helper.mjs";
import { addStartingBonus } from "./deathInSpace/sheets.mjs";
import mongoSanitize from "express-mongo-sanitize"

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

function isAuthenticated(req, res, next) {
    if (!req.user) return res.status(401).json({body:"access denied"});
    next();
};

app.get("/", (req, res, next) => {
    return res.json({body: "This is the grimoire backend :D"})
})

app.post("/dis/random", isAuthenticated, async (req, res, next) => {

    let json = req.body
    const user = await User.findById(req.userId).exec()
    const game = await Game.findOne({name: "Death In Space"}).exec()
    //pick a random origin in between it and its length
        
    const dex = randomNumberBetween(3, -3)
    const hitPoints = rollNSidedDie(8)

    const origins = await DISOrigin.find({}).exec()
    const randomOrigin = origins[randomNumberBetween(origins.length - 1)]
    const stats = {
        bdy: randomNumberBetween(3, -3), //random number between 3 and -3
        dex: dex,
        svy: randomNumberBetween(3, -3),
        tech: randomNumberBetween(3, -3),
    } 
    let deathInSpaceSheet = new DeathInSpaceSheet({
        owner: user._id, 
        game: game._id, 
        characterName: json.name,

        stats: stats,
        inventory: [],
        mutations: [],
        voidPoints: 0,
        defenseRating: 12 + dex,
        maxHitPoints: hitPoints,
        hitPoints: hitPoints,
        origin: randomOrigin._id,
        originBenefit: randomNumberBetween(randomOrigin.benefits.length - 1)
    })

    const errors = deathInSpaceSheet.validateSync()
    if(errors && errors.errors.length > 0){
        return res.status(403).json({errors: errors.errors})
    }
    //check if needed to add anything else to the character sheet because of poor roles 
    //(p.20) of the rule book

    //if have negative net value for stats
    if(Object.keys(stats).reduce((sum, stat) => sum + stats[stat], 0) < 0){
        //add starting bonus
        deathInSpaceSheet = await addStartingBonus(deathInSpaceSheet)
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    deathInSpaceSheet.save().then((saved) => {
        //creating the user-game-sheet mapping
        const mapping = new UserSheetMapping({
            game: saved.game,
            user: saved.owner,
            sheet: saved._id,
            sheetModel: deathInSpaceSheet.constructor.modelName
        })
        mapping.save().then(async (savedMap) => {
            session.commitTransaction()
            .then(() => session.endSession())
            .then(() => res.status(201).json({saved}))
        }).catch(async (err) => {
            session.abortTransaction()
            .then(() => session.endSession())
            .then(() => res.status(400).json({errors: err}))
        })
    }).catch(err => {
        if(err.name === "ValidationError"){
            return res.status(400).json({error: err.errors})
        }
        return res.status(500).json(err.errors)
    })
})


app.post("/api/sheet/dis/create", isAuthenticated, async(req, res, next) => {
    let json = req.body
    const user = await User.findOne().exec()
    const game = await Game.findOne({name: "Death In Space"}).exec()
    //pick a random origin in between it and its length

    const stats = !json.stats ? {} : {
        bdy: json.stats.bdy, //random number between 3 and -3
        dex: json.stats.dex,
        svy: json.stats.svy,
        tech: json.stats.tech,
    }
        
    let deathInSpaceSheet = new DeathInSpaceSheet({
        owner: user._id, 
        game: game._id, 
        characterName: json.name,

        stats: stats,
        inventory: json.inventory,
        mutations: json.mutations,
        voidPoints: 0,
        defenseRating: 12 + json.stats.dex,
        maxHitPoints: json.hitPoints,
        hitPoints: json.hitPoints,
        origin: json.origin,
        originBenefit: json.originBenefit
    })

    const errors = deathInSpaceSheet.validateSync()
    if(errors && errors.errors.length > 0){
        return res.status(403).json({errors: errors.errors})
    }
    //check if needed to add anything else to the character sheet because of poor roles 
    //(p.20) of the rule book

    //if have negative net value for stats
    if(!json.addedBonus && Object.keys(stats).reduce((sum, stat) => sum + stats[stat], 0) < 0){
        //add starting bonus
        deathInSpaceSheet = await addStartingBonus(deathInSpaceSheet)
    }
    //starting a transaction to make sure both sheets get saved
    const session = await mongoose.startSession();
    session.startTransaction();
    deathInSpaceSheet.save().then((saved) => {
        //creating the user-game-sheet mapping
        const mapping = new UserSheetMapping({
            game: saved.game,
            user: saved.owner,
            sheet: saved._id,
            sheetModel: "DISSheet"
        })
        mapping.save().then(async (savedMap) => {
            await session.commitTransaction()
            await session.endSession()
            return res.status(201).json({saved})
        }).catch(async (err) => {
            await session.abortTransaction()
            await session.endSession()
            throw err
        })
    }).catch(err => {
        if(err.name === "ValidationError"){
            return res.status(403).json({error: err.errors})
        }
        return res.status(500).json(err.errors)
    })
})

//WIP need to figure out how to populate fields of sheet
//without know what fields are keys, maybe add custom function?
app.get("/api/sheet/:id", async (req, res, next) => {
    UserSheetMapping.findOne({sheet: req.params.id}).exec()
    .then((mapping) => {
        if(!mapping)
            return res.status(404).json({body: `sheet with id ${req.params.id} not found`})
        const tempModel = new mongoose.model(mapping.sheetModel)
        return tempModel.findById(mapping.sheet).then(charSheet => res.json(charSheet))
    }).catch(err => {console.log(err); res.status(400).json(err.errors)})
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

//MEANT FOR TESTING PURPOSES
//BASIC API TO INSERT TEST CLASS INTO DB
app.post('/users/signup', async (req, res, next) => {
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