import { Router } from "express";
import { isAuthenticated } from "../helper.mjs";
import { Group } from "./schema.mjs";
import { Game, User } from "../schemas.mjs";
import mongoose, {isValidObjectId, mongo} from 'mongoose'

export const groupRouter = Router()

// Looking for group endpoints

// endpoint to add a new game group
// requires a group name, game name, and owner is the user who created the group
groupRouter.post('/create', isAuthenticated, async (req, res, next) => {
    const json = req.body;
    const owner = await User.findById(req.userId).exec();
    const game = await Game.findOne({name: json.game}).exec();
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
        owner: owner._id,
        game: game._id,
        location: json.location ? json.location : {
            type: "Point",
            coordinates: [0, 0]
        },
        preferences: {
            combat: json.preferences.combat ? json.preferences.combat : 0,
            puzzles: json.preferences.puzzles ? json.preferences.puzzles : 0,
            social: json.preferences.social ? json.preferences.social : 0,
            playerDriven: json.preferences.playerDriven ? json.preferences.playerDriven : 0,
            roleplaying: json.preferences.roleplaying ? json.preferences.roleplaying : 0,
            homebrew: json.preferences.homebrew ? json.preferences.homebrew : 0
        }
    });
    group.save().then((saved) => {
        return res.status(201).json({saved})
    }).catch((err) => {
        res.status(500).json({errors: err})
    })
})

// endpoint to get paginated list of game groups given page number and page size
groupRouter.get('/page/', async (req, res, next) => {
    const page = Number(req.query.page) || DEFAULTPAGE
    const size = Number(req.query.size) || DEFAULTLIMIT

    // if(!page){
    //     res.status(422).json({body: "missing page number"})
    //     return
    // }
    // if(!size){
    //     res.status(422).json({body: "missing page size"})
    //     return
    // }
    Group.find({}).skip(page * size).limit(size).exec()
    .then((docs) => {
        res.status(200).json(docs)
    }).catch(err => {
        res.status(500).json({errors: err})
    })
})


// endpoint to get paginated list of game groups for a specific game
// the game is given in the request body
groupRouter.get('/game/:id/page', async (req, res, next) => {
    const game = req.params.id
    const page = Number(req.query.page) || DEFAULTPAGE
    const size = Number(req.query.size) || DEFAULTLIMIT
    if(!id){
        res.status(422).json({body: "missing game: id"})
        return
    }
    // if(page){
    //     res.status(422).json({body: "missing page number"})
    //     return
    // }
    // if(!size){
    //     res.status(422).json({body: "missing page size"})
    //     return
    // }
    Group.find({game: game}).skip(page * size).limit(size).exec()
    .then((docs) => {
        res.status(200).json(docs)
    }).catch(err => {
        res.status(500).json({errors: err})
    })
})

// endpoint to get paginated list of game groups owned by a specific user
groupRouter.get('/user/:id/owner/page', async (req, res, next) => {
    const id = req.params.id
    const page = Number(req.query.page) || DEFAULTPAGE
    const size = Number(req.query.size) || DEFAULTLIMIT
    if(!isValidObjectId(req.params.id)) {
        res.status(400).json({body: "invalid object id"})
        return
    }
    // if(!page){
    //     res.status(422).json({body: "missing page number"})
    //     return
    // }
    // if(!size){
    //     res.status(422).json({body: "missing page size"})
    //     return
    // }
    Group.find({owner: id}).skip(page * size).limit(size).exec()
    .then((docs) => {
        res.status(200).json(docs)
    }).catch(err => {
        res.status(500).json({errors: err})
    })
})

// endpoint to get paginated list of game groups a specific user is a member of
groupRouter.get('/user/:id/member/page', async (req, res, next) => {
    const id = req.params.id
    const page = Number(req.query.page) || DEFAULTPAGE
    const size = Number(req.query.size) || DEFAULTLIMIT
    if(!isValidObjectId(req.params.id)) {
        res.status(400).json({body: "invalid object id"})
        return
    }
    // if(!page){
    //     res.status(422).json({body: "missing page number"})
    //     return
    // }
    // if(!size){
    //     res.status(422).json({body: "missing page size"})
    //     return
    // }
    Group.find({members: id}).skip(page * size).limit(size).exec()
    .then((docs) => {
        res.status(200).json(docs)
    }).catch(err => {
        res.status(500).json({errors: err})
    })
})

// endpoint to get paginated list of game groups given a input of user preferences
// the user preferences are given in the request body
groupRouter.get('/preferences/page', async (req, res, next) => {
    const page = Number(req.query.page) || DEFAULTPAGE
    const size = Number(req.query.size) || DEFAULTLIMIT
    const json = req.body
    // if(!page){
    //     res.status(422).json({body: "missing page number"})
    //     return
    // }
    // if(!size){
    //     res.status(422).json({body: "missing page size"})
    //     return
    // }
    // compare vector of user preferences to vector of game group preferences and find the closest matches
    // sort the matches by distance from the user preferences    
    Group.aggregate([
        {
            $set: {
                distance: {
                    $sqrt: {
                        $add: [
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
        },
        {$sort: {distance: 1}},
        {$skip: page * size},
        // {$limit: size},
        {$limit: 10},
    ])
        .then((docs) => {
            res.status(200).json(docs)
        }).catch(err => {
            res.status(500).json({errors: err})
        })   
})

// endpoint to get paginated list of game groups within a certain distance of a location
// the location is given in the request body
groupRouter.get('/location/page', async (req, res, next) => {
    const page = Number(req.query.page) || DEFAULTPAGE
    const size = Number(req.query.size) || DEFAULTLIMIT
    const json = req.body
    // if(!page){
    //     res.status(422).json({body: "missing page number"})
    //     return
    // }
    // if(!size){
    //     res.status(422).json({body: "missing page size"})
    //     return
    // }
    // find game groups within a certain distance of the location
    Group
        .aggregate([
            {
                $match: {
                    location: {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [json.longitude, json.latitude]
                            },
                            $maxDistance: json.distance
                        }
                    }
                }
            },
            {$skip: page * size},
            // {$limit: size},
            {$limit: 10}
        ])
        .then((docs) => {
            res.status(200).json(docs)
        }).catch(err => {
            res.status(500).json({errors: err})
        })
})

// endpoint to get a specific game group
groupRouter.get('/:id', async (req, res, next) => {
    const id = req.params.id
    if(!isValidObjectId(req.params.id)) {
        res.status(400).json({body: "invalid object id"})
        return
    }
    Group.findById(id).exec()
    .then((doc) => {
        if (!doc) {
            res.status(404).json({body: `group with id ${id} not found`})
            return
        }
        res.status(200).json(doc)
    } ).catch(err => {
        res.status(500).json({errors: err})
    })
})

// endpoint to join a game group as a member
groupRouter.patch('/:id/join', isAuthenticated, async (req, res, next) => {
    const id = req.params.id
    const user = req.userId
    if(!isValidObjectId(id)) {
        res.status(400).json({body: "invalid object id"})
        return
    }
    const group = await Group.findById(id).exec()
    if(!group){
        res.status(404).json({body: `group with id ${id} not found`})
        return
    }
    if(group.members.includes(user)){
        res.status(409).json({body: `user ${user} already in group ${id}`})
        return
    }
    group.members.push(user)
    group.save().then((doc) => {
        res.status(201).json(doc)
    }).catch(err => {
        res.status(500).json({errors: err})
    })
})

// endpoint to leave a game group as a member
groupRouter.patch('/:id/leave', isAuthenticated, async (req, res, next) => {
    const id = req.params.id
    const user = req.userId
    if(!isValidObjectId(req.params.id)) {
        res.status(400).json({body: "invalid object id"})
        return
    }
    const group = await Group.findById(id).exec()
    if(!group){
        res.status(404).json({body: `group with id ${id} not found`})
        return
    }
    if(!group.members.includes(user)){
        res.status(409).json({body: `user ${user} not in group ${id}`})
        return
    }
    group.members = group.members.filter((member) => member != user)
    group.save().then((doc) => {
        res.status(201).json(doc)
    }).catch(err => {
        res.status(500).json({errors: err})
    })
})

// endpoint to update a game group
groupRouter.patch('/:id', isAuthenticated, async (req, res, next) => {
    const id = req.params.id
    const json = req.body
    const user = req.userId
    const game = await Game.findOne({name: json.game}).exec()
    if(!isValidObjectId(req.params.id)) {
        res.status(400).json({body: "invalid object id"})
        return
    }
    const group = await Group.findById(id).exec()
    if(!group){
        res.status(404).json({body: `group with id ${id} not found`})
        return
    }
    if(group.owner != user){
        res.status(403).json({body: `user ${user} not authorized to update group ${id}`})
        return
    }
    if(json.name){
        group.name = json.name
    }
    if(json.owner){
        group.owner = json.owner
    }
    if(json.members){
        group.members = json.members
    }
    if(json.game){
        group.game = game
    }
    if(json.location){
        group.location = json.location
    }
    if(json.preferences){
        group.preferences = json.preferences
    }
    group.save().then((doc) => {
        res.status(201).json(doc)
    }).catch(err => {
        res.status(500).json({errors: err})
    })
})

// endpoint to delete a specific game group
groupRouter.delete('/:id', isAuthenticated, async (req, res, next) => {
    const id = req.params.id
    const user = req.userId
    if(!isValidObjectId(req.params.id)) {
        res.status(400).json({body: "invalid object id"})
        return
    }
    const group = await Group.findById(id).exec()
    if(!group){
        res.status(404).json({body: `group with id ${id} not found`})
        return
    }
    if(group.owner != user){
        res.status(403).json({body: `user ${user} not authorized to delete group ${id}`})
        return
    }
    Group.deleteOne({_id: id}).exec()
    .then((doc) => {
        res.status(201).json({body: `group ${id} deleted`})
    }).catch(err => {
        res.status(500).json({errors: err})
    })
})

export default groupRouter