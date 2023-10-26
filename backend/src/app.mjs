import { createServer } from "http";
import express from "express";
import session from "express-session";
import dotenv from 'dotenv';
import mongoose, {mongo} from 'mongoose'
import { DISMutation, DISOrigin, DeathInSpaceSheet } from "./deathInSpace/schema.mjs";
import { Game, User, UserSheetMapping } from "./schemas.mjs";
import { randomNumberBetween, rollNSidedDie, saltHashPassword } from "./helper.mjs";
import { addStartingBonus } from "./deathInSpace/sheets.mjs";
import sanitize from "mongo-sanitize";

dotenv.config();

const PORT = 8000;
await mongoose.connect(process.env.MONGO_URL)

const app = express();

app.use(express.json())

app.use(
    session({
      secret: process.env.SESSION_KEY,
      resave: false,
      saveUninitialized: true,
    })
);

app.use(function (req, res, next) {
    req.username = req.session.username ? req.session.username : null
    console.log("HTTP request", req.username, req.method, req.url, req.body);
    next();
});

app.get("/", (req, res, next) => {
    return res.json({body: "This is the grimoire backend :D"})
})

app.post("/dis/random", async (req, res, next) => {
    let json = req.body
    const user = await User.findOne().exec()
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
    deathInSpaceSheet.save().then((saved) => {
        //creating the user-game-sheet mapping
        const mapping = new UserSheetMapping({
            game: saved.game,
            user: saved.owner,
            sheet: saved._id,
            sheetModel: deathInSpaceSheet.constructor.modelName
        })
        mapping.save().then(savedMap => {
            return res.status(201).json({body: "Success", result: saved})
        }).catch(err => {
            deathInSpaceSheet.delete()
            throw err
        })
    }).catch(err => {
        if(err.name === "ValidationError"){
            return res.status(403).json({error: err.errors})
        }
        return res.status(500).json(err.errors)
    })
})


app.post("/api/dis/create", async(req, res, next) => {
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
    deathInSpaceSheet.save().then((saved) => {
        //creating the user-game-sheet mapping
        const mapping = new UserSheetMapping({
            game: saved.game,
            user: saved.owner,
            sheet: saved._id,
            sheetModel: deathInSpaceSheet.constructor.modelName
        })
        mapping.save().then(savedMap => {
            return res.status(201).json({body: "Success", result: saved})
        }).catch(err => {
            deathInSpaceSheet.delete()
            throw err
        })
    }).catch(err => {
        if(err.name === "ValidationError"){
            return res.status(403).json({error: err.errors})
        }
        return res.status(500).json(err.errors)
    })
})

app.get("/dis/get/:id", async (req, res, next) => {
    let charSheet = await DeathInSpaceSheet.findById(sanitize(req.params.id)).populate(['mutations', "origin"]).exec()
    return res.json(charSheet)
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

    const sameUser = User.findOne({username: sanitize(json.username)}).exec()
    if(sameUser){
        return res.status(409).json({body:  "username " + json.username + " already exists"});
    }

    saltHashPassword(json.password, async (err, hash, salt) => {
        if(err)
            throw err

        const user = newUser({
            username: json.username,
            password: hash,
            salt: salt
        }) 
        const newUser = await user.save()
        req.session.user = newUser.username
        res.status(201).json({username: user})
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