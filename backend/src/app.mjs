import { createServer } from "http";
import express from "express";
import session from "express-session";
import dotenv from 'dotenv';
import mongoose, { model } from 'mongoose'
import { DISMutation, DISOrigin, DeathInSpaceSheet } from "./deathInSpace/schema.mjs";
import { CharacterSheet, Game, User } from "./schemas.mjs";
import { randomNumberBetween, rollNSidedDie, saltHashPassword } from "./helper.mjs";
import { addStartingBonus } from "./deathInSpace/sheets.mjs";

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

app.post("/game", async (req, res, next) => {
    const json = req.body
    const newGame = new Game({name: json.name, mainDie: json.mainDie})
    console.log('newGame', newGame)
    const result = await newGame.save()
    return res.json({body: "success!", result: result})
})

app.post("/dis/random", async (req, res, next) => {
    const json = req.body
    const user = await User.findOne().exec()
    const game = await Game.findOne({name: "Death In Space"}).exec()

    //querying origns now to wait for them later
    //choose a random origin

    let origins = DISOrigin.find({}).exec()

    //calculating dexterity score ahead of time since used in defense rating
    const dexScore = randomNumberBetween(3, -3)

    const baseSheet = new CharacterSheet(
        {
        owner: user._id, 
        game: game._id, 
        characterName: json.name,

        stats: [{
            name: "Body",
            value: randomNumberBetween(3, -3), //random number between 3 and -3
            },
            {
            name: "Dexterity",
            value: dexScore, //random number between 3 and -3
            },{
                name: "Savy",
                value: randomNumberBetween(3, -3), //random number between 3 and -3
            },
            {
                name: "Technology",
                value: randomNumberBetween(3, -3), //random number between 3 and -3
            }
        ],
        inventory: [{
            name: "Shitty Code",
            description: "Not even sure if it works"
        }]
    })

    const hitPoints = rollNSidedDie(8)

    //resolving our await
    origins = await origins

    const randomOrigin = randomNumberBetween(origins.length - 1)
    
    const randomBenefit = randomNumberBetween(origins[randomOrigin].benefits.length - 1)

    //pick a random origin in between it and its length

    const deathInSpaceSheet = new DeathInSpaceSheet({
        baseCharacterSheet : baseSheet,
        mutations: [],
        voidPoints: 0,
        defenseRating: 12 + dexScore,
        maxHitPoints: hitPoints,
        hitPoints: hitPoints,
        origin: origins[randomOrigin],
        originBenefit: randomBenefit
    })

    //check if needed to add anything else to the character sheet because of poor roles
    //(p.20) of the rule book

    //if have negative net value for stats
    if(baseSheet.stats.reduce((sum, stat) => sum + stat.value, 0) < 0){
        //add starting bonus
        deathInSpaceSheet = addStartingBonus(deathInSpaceSheet)
    }

    const saved = await deathInSpaceSheet.save()
    return res.json({body: "Success", result: saved})
})

app.get("/dis/get/:id", async (req, res, next) => {
    let charSheet = await DeathInSpaceSheet.findById(req.params.id).populate(['mutations', "origin"]).exec()

    return res.json(charSheet)
})

app.post('/dis/:id/bonus', async(req, res, next) => {
    let charSheet = await DeathInSpaceSheet.findById(req.params.id).populate(['mutations', "origin"]).exec()
    addStartingBonus(charSheet)

    return res.json({body: "starting bonus added"})
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

    const sameUser = User.findOne({username: json.username}).exec()
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