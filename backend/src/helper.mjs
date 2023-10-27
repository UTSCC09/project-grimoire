import { compare, genSalt, hash } from "bcrypt";

export function saltHashPassword(password, saltRounds=10){
    return new Promise((resolve, reject) => {
        genSalt(saltRounds, function(err, salt) {
            if(err){
                reject(err)
            }else{
                hash(password, salt, function(err, hash) {
                    if(err)
                        reject(err)
                    resolve([hash, salt])
                });
            }
        });
    })
}

export function isAuthenticated(req, res, next) {
    if (!req.username) return res.status(401).end("access denied");
    next();
};

export function compareHash(base, hashedString, callback){
    compare(base, hashedString, callback)
}

export function randomNumberBetween(max, min=0){
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function rollNSidedDie(n){
    return randomNumberBetween(n, 1)
}