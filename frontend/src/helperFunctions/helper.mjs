export function randomNumberBetween(max, min=0){
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function rollNSidedDie(n){
    return randomNumberBetween(n, 1)
}

export function isObjectEmpty(obj){
    return Object.keys(obj).length === 0
}