import { compare, genSalt, hash } from "bcrypt";

export function saltHashPassword(password, callback){
    genSalt(saltRounds, function (errS, salt) {
      hash(password, salt, function (errH, hash) {
          callback(errH || errS, hash, salt)
      })
    })
}

export function isAuthenticated(req, res, next) {
    if (!req.username) return res.status(401).end("access denied");
    next();
};

export function compareHash(base, hashedString, callback){
    compare(base, hashedString, callback)
}