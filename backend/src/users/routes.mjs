import { Router } from "express";
import { isAuthenticated } from "../helper.mjs";
import { User } from "../schemas.mjs";
import { Group } from "../groups/schema.mjs";

export const UserRouter = new Router()

UserRouter.get('/currUser', isAuthenticated, async (req, res, next) => {
    const uPromise = User.findById(req.userId, {password: 0, salt: 0}).exec()
    const uGroups = Group.find({members: {$in: [req.userId]}}).exec()

    Promise.all([uPromise, uGroups]).then(([user, groups]) => {
        user.groups = [groups]
        return res.status(200).json(user)
    }).catch(e => next(e))
})