import { Router } from "express";
import { isAuthenticated } from "../helper.mjs";
import { Group } from "./schema.mjs";
import { Game, User } from "../schemas.mjs";
import mongoose, {isValidObjectId, mongo} from 'mongoose'
import { DEFAULTLIMIT, DEFAULTPAGE } from "../app.mjs";

export const groupRouter = Router()

// Looking for group endpoints

// endpoint to add a new game group
// requires a group name, game name, and owner is the user who created the group
groupRouter.post('/api/groups/', isAuthenticated, async (req, res, next) => {
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
        game: json.game,
        preferences: {
            combat: json.combat ? json.combat : 0,
            puzzles: json.puzzles ? json.puzzles : 0,
            social: json.social ? json.social : 0,
            playerDriven: json.playerDriven ? json.playerDriven : 0,
            roleplaying: json.roleplaying ? json.roleplaying : 0,
            homebrew: json.homebrew ? json.homebrew : 0
        }
    });
    group.save().then((saved) => {
        return res.status(201).json({saved})
    }).catch((err) => {
        res.status(500).json({errors: err})
    })
})

// endpoint to join a game group as a member
groupRouter.post('/api/groups/:id/join', isAuthenticated, async (req, res, next) => {
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
groupRouter.post('/api/groups/:id/leave', isAuthenticated, async (req, res, next) => {
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
groupRouter.get('/api/groups', async (req, res, next) => {
    const model = await Group.find({}).exec()
    res.status(200).json(model)
})

// endpoint to get paginated list of game groups given page number and page size
groupRouter.get('/api/groups/page/', async (req, res, next) => {
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


// endpoint to get paginated list of game groups for a specific game
// the game is given in the request body
groupRouter.get('/api/groups/game/page', async (req, res, next) => {
    const game = req.body.game
    const page = req.query.page
    const size = req.query.size
    if(!id){
        res.status(422).json({body: "missing game: id"})
        return
    }
    if(!page){
        res.status(422).json({body: "missing page number"})
        return
    }
    if(!size){
        res.status(422).json({body: "missing page size"})
        return
    }
    const model = await Group.find({game: game}).skip(page * size).limit(size).exec()
    res.status(200).json(model)
})

// endpoint to get paginated list of game groups owned by a specific user
groupRouter.get('/api/groups/user/:id/owner/page', async (req, res, next) => {
    const id = req.params.id
    const page = req.query.page
    const size = req.query.size
    if(!id){
        res.status(422).json({body: "missing user: id"})
        return
    }
    if(!page){
        res.status(422).json({body: "missing page number"})
        return
    }
    if(!size){
        res.status(422).json({body: "missing page size"})
        return
    }
    const model = await Group.find({owner: id}).skip(page * size).limit(size).exec()
    res.status(200).json(model)
})

// endpoint to get paginated list of game groups a specific user is a member of
groupRouter.get('/api/groups/user/:id/member/page', async (req, res, next) => {
    const id = req.params.id
    const page = req.query.page
    const size = req.query.size
    if(!id){
        res.status(422).json({body: "missing user: id"})
        return
    }
    if(!page){
        res.status(422).json({body: "missing page number"})
        return
    }
    if(!size){
        res.status(422).json({body: "missing page size"})
        return
    }
    const model = await Group.find({members: id}).skip(page * size).limit(size).exec()
    res.status(200).json(model)
})

// endpoint to get paginated list of game groups given a input of user preferences
// the user preferences are given in the request body
groupRouter.get('/api/groups/preferences/page', async (req, res, next) => {
    const page = req.query.page
    const size = req.query.size
    const json = req.body
    if(!page){
        res.status(422).json({body: "missing page number"})
        return
    }
    if(!size){
        res.status(422).json({body: "missing page size"})
        return
    }
    // compare vector of user preferences to vector of game group preferences and find the closest matches
    // sort the matches by distance from the user preferences
    const model = await Group
                        .aggregate([
                            {
                                $match: {
                                    $or: [
                                        {name: {$regex: json.name, $options: 'i'}},
                                        {game: {$regex: json.game, $options: 'i'}}
                                    ]
                                }
                            },
                            {
                                $project: {
                                    distance: {
                                        $sqrt: {
                                            $add: [
                                                // vector distance of user preferences and game group preferences
                                                {$pow: [{$subtract: ["$preferences.combat", json.combat]}, 2]},
                                                {$pow: [{$subtract: ["$preferences.puzzles", json.puzzles]}, 2]},
                                                {$pow: [{$subtract: ["$preferences.social", json.social]}, 2]},
                                                {$pow: [{$subtract: ["$preferences.playerDriven", json.playerDriven]}, 2]},
                                                {$pow: [{$subtract: ["$preferences.roleplaying", json.roleplaying]}, 2]},
                                                {$pow: [{$subtract: ["$preferences.homebrew", json.homebrew]}, 2]}
                                            ]
                                        }
                                    }
                                }
                            }
                        ])
                        .skip(page * size)
                        .limit(size)
                        .exec()
    res.status(200).json(model)
})

// endpoint to get a specific game group
groupRouter.get('/api/groups/:id', async (req, res, next) => {
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

// endpoint to update a game group
groupRouter.patch('/api/groups/:id', isAuthenticated, async (req, res, next) => {
    const id = req.params.id
    const json = req.body
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
    if(model.owner != user){
        res.status(403).json({body: `user ${user} not authorized to update group ${id}`})
        return
    }
    if(json.name){
        model.name = json.name
    }
    if(json.owner){
        model.owner = json.owner
    }
    if(json.members){
        model.members = json.members
    }
    if(json.game){
        model.game = json.game
    }
    if(json.preferences){
        model.preferences = json.preferences
    }
    model.save().then((doc) => {
        res.status(201).json(doc)
    }).catch(err => {
        res.status(500).json({errors: err})
    })
})

// endpoint to delete a specific game group
groupRouter.delete('/api/groups/:id', isAuthenticated, async (req, res, next) => {
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
    if(model.owner != user){
        res.status(403).json({body: `user ${user} not authorized to delete group ${id}`})
        return
    }
    model.delete().then((doc) => {
        res.status(201).json(doc)
    }).catch(err => {
        res.status(500).json({errors: err})
    })
})

export default groupRouter