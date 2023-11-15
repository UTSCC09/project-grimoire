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

export function removeSpacesFromQuery(queryObj){
    // Extract query parameters and replace %20 with spaces
    const test = Object.keys(queryObj).reduce((params, key) => {
        if(params[key] instanceof String){
            params[key] = queryObj[key].replace(/%20/g, ' ');
        }else{
            params[key] = queryObj[key]
        }
        return params;
    }, {});
    return test
}

export function isAuthenticated(req, res, next) {
    if (!(req.user && req.userId)) return res.status(401).end("access denied");
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

//regex used to validate emails, taken from https://emailregex.com/
const OFFICIALEMAILREGEX =  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
export function isValidEmail(email){
    try{
        return String(email)
        .toLowerCase()
        .match(OFFICIALEMAILREGEX);
    }catch(e){
        return false
    } 
}

export function mongoLikeString(value){
    //anything containing value as a substring, case insensitive
    return {$regex: `.*${value}.*`, $options: 'i'}
}