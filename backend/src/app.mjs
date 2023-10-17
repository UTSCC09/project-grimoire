import { createServer } from "http";
import express from "express";
import session from "express-session";
import dotenv from 'dotenv';
import mongoose, { model } from 'mongoose'
import { User } from "./schemas.mjs";
import { saltHashPassword } from "./helper.mjs";

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