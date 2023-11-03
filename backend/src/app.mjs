import { createServer } from "https";
import express from "express";
import session from "express-session";
import dotenv from 'dotenv';
import mongoose, {mongo} from 'mongoose'
import { Game, User, UserSheetMapping } from "./schemas.mjs";
import { compare } from "bcrypt";
import {saltHashPassword, isAuthenticated, isValidEmail } from "./helper.mjs";
import mongoSanitize from "express-mongo-sanitize"
import disRouter from "./deathInSpace/routes.mjs";
import { readFileSync } from "fs";
import sheetRouter from "./genericSheets/routes.mjs";
import { sendValidationEmail } from "./aws/ses_helper.mjs";

dotenv.config();

const privateKey = readFileSync( 'server.key' );
const certificate = readFileSync( 'server.crt' );
const config = {
        key: privateKey,
        cert: certificate
};

const PORT = 8000;
export const DEFAULTPAGE = 0
export const DEFAULTLIMIT = 10
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
    console.log("HTTPS request", req.user, req.method, req.url, req.body);
    next();
});

//adding all the Death In Space routes
app.use('/api/sheets/dis', disRouter)

app.use('/api/sheets', sheetRouter)

/**
 * sanity check endpoint to test connection
 */
app.get("/", (req, res, next) => {
    return res.json({body: "This is the grimoire backend :D"})
})

/**
 * endpoint used to validate user on signup, creates a user if code is correct
 * 
 * @param {Number} validation the code the user is trying to validate
 */
app.post('/validate', (req, res, next) => {
    const json = req.body
    if(req.session.validationCode && json.validation == req.session.validationCode){
        const user = new User(req.session.tempUser) 
        user.save().then((newUser) => {
            req.session.tempUser = undefined
            req.session.validationCode = undefined
            req.session.user = newUser.email
            req.session.userId = newUser._id
            res.status(201).json({email: user.email})
        }).catch(err => {
            res.status(400).json({errors: err})
        })
    }else{
        res.status(403).json({body: "invalid validation code"})
    }
})

/**
 * endpoint used to signup for the app, initates signup, and sends verification email
 * 
 * @param {String} email email for new user, must not already exist
 * @param {String} password password for new user, must not already exist
 */
app.post('/api/signup', async (req, res, next) => {
    let json = req.body
    if(!json.email){
        return res.status(400).json({body: "Missing user: email"})
    }
    if(!isValidEmail(json.email)){
        return res.status(400).json({body: "Email is invalid"})
    }
    const email = String(json.email).toLowerCase()
    if(!json.password){
        return res.status(400).json({body: "Missing user: password"})
    }

    User.findOne({email: email}).exec().then((sameUser) => {
        if(sameUser){
            return res.status(409).json({body:  "email " + email + " already exists"});
        }
    
        saltHashPassword(json.password).then(async ([hash, salt])=> {
            const tempUser = {
                email: email,
                password: hash,
                salt: salt
            }
            const [code, emailPromise] = sendValidationEmail(email)
            emailPromise.then((resp) => {
                req.session.validationCode = code
                req.session.tempUser = tempUser
                return res.json(resp)
            }).catch(err => {
                res.status(500).json(err)
            })
        }).catch((err) => {
            res.status(500).json({errors: err})
        })
    })
})

/**
 * signs in user to application if they have the proper credentials
 * @param {String} email email of user
 * @param {String} password password of user
 */
app.post("/api/signin", (req, res, next) => {
    let email
    let password
    try{
        email = String(req.body.email).toLowerCase()
        password = String(req.body.password)
    }catch(e){
        return res.status(400).json({body: "email and password must both be strings"})
    }
    User.findOne({email:email}).exec().then((doc) => {
        if(!doc)
            return res.status(404).json({body: `User with email ${email} not found`})

        compare(password, doc.password).then(result =>  {
            // result is true is the password matches the salted hash from the database
            if (!result) return res.status(401).json({body: "access denied"});
            //write email into session
            req.session.user = email;
            req.session.userId = doc._id
            return res.json(email);
        });
    }).catch(err => {
        return res.status(400).json({errors: err})
    })
        
})

/**
 * signs user out of application
 */
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

export const server = createServer(config, app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTPS server on http://localhost:%s", PORT);
});