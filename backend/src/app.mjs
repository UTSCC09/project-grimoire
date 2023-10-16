import { createServer } from "http";
import express from "express";
import session from "express-session";
import dotenv from 'dotenv';
import mongoose, { model } from 'mongoose'
import { User } from "./schemas.mjs";

dotenv.config();

const PORT = 8000;
await mongoose.connect(process.env.MONGO_URL)

const app = express();

app.use(express.json())

app.use(
    session({
      secret: "this secret should be hidden in an .env file",
      resave: false,
      saveUninitialized: true,
    })
);

function isAuthenticated(req, res, next) {
    if (!req.username) return res.status(401).end("access denied");
    next();
};

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
app.post('/user', async (req, res, next) => {
    const json = req.body
    const user = new User({
        username: json.username,
    })
    const newUser = await user.save()
    res.status(201).json(newUser)
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