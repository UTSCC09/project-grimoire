const URL = process.env.REACT_APP_URL

function buildGeneralSearch(url, searchParams, signal=undefined){
  let urlString = url + "?"
  for(let key of Object.keys(searchParams)){
    urlString += `${key}=${searchParams[key]}&`
  }
  return fetch(urlString, {
    method: 'GET',
    credentials: 'include',
    signal: signal
  })
}

//The following functions return a Promise. The functions which call these ones must
//handle that Promise asynchonously
export function signUp(username, password) 
{
    const postData = {
        email: username,
        password: password
    }
    return fetch(`${URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Origin': window.location.origin,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
        credentials: 'include'
      })
    
}


export function logIn(username, password)
{
    const postData = {
        email: username,
        password: password
    }
    return fetch(`${URL}/api/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
        credentials: 'include'
      })
}

export function postGroup(latitude, longitude, groupName, groupGame, combat, puzzles, 
                          social, playerDriven, roleplaying, homebrew)
{
  const data = {
    name: groupName,
    game: groupGame,
    longitude: longitude,
    latitude: latitude,
    combat: combat,
    puzzles: puzzles,
    social: social,
    playerDriven: playerDriven,
    roleplaying: roleplaying,
    homebrew: homebrew
  }
  console.log("lat " + latitude + " long:" + longitude);
  return fetch(`${URL}/api/groups`, {
    method: 'POST',
    headers:
    {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include'
  })
}

export function dualFactorValidate(code)
{
  const post = {
    validation: parseInt(code)
  }
  return fetch(`${URL}/api/validate/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }, 
    credentials: 'include',
    body: JSON.stringify(post)})
}

export function logOut()
{
    return fetch(`${URL}/api/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        credentials: 'include',
        body: JSON.stringify({})
      })
}

export function getSheet(ID)
{
    return fetch(`${URL}/api/sheets/${ID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
}

export function deleteSheet(ID)
{
    return fetch(`${URL}/api/sheets/${ID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
}

//gets the Current User from the site cookie. Code provided by Prof. Sans
export function getCurrentUser() {
  if (!document.cookie)
    return null; 
  let username = document.cookie.split("Username=")[1];
  if (username.length == 0) return null;
  return decodeURIComponent(username);
}

// Code used for session testing only
export function getSessionCode() {
  return fetch(`${URL}/test/sessionCode`, {
    method: 'GET',
    credentials: 'include'
    })
}

/**CHARACTER CREATION */
/*---------------------------------------------*/
export function getGames(searchCritera={}, signal=undefined){
  let urlString = `${URL}/api/games?`
  for(let key of Object.keys(searchCritera)){
    urlString += `${key}=${searchCritera[key]}&`
  }
  return fetch(urlString, {
    method: 'GET',
    credentials: 'include',
    signal: signal
  })
}

export function getSkins(searchCritera={}, signal=undefined){
  let urlString = `${URL}/api/mhearts/skins?`
  for(let key of Object.keys(searchCritera)){
    urlString += `${key}=${searchCritera[key]}&`
  }
  return fetch(urlString, {
    method: 'GET',
    credentials: 'include',
    signal: signal
  })
}

export function getMoves(searchCritera, signal=undefined){
  let urlString = `${URL}/api/mhearts/moves?`
  for(let key of Object.keys(searchCritera)){
    urlString += `${key}=${searchCritera[key]}&`
  }
  return fetch(urlString, {
    method: 'GET',
    credentials: 'include',
    signal: signal
  })
}

/*GROUPS */
/*---------------------------------------------*/
export function getGroups(page=0){
  return fetch(`${URL}/api/groups/page?page=${page}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    credentials: 'include',
  })
}

/* DIS ORIGINS */
export function getDISOrigins(searchObj, signal=undefined){
  return buildGeneralSearch(`${URL}/api/dis/origins`, searchObj, signal)
}

export function getDISEquipment(searchObj, signal){
  return buildGeneralSearch(`${URL}/api/dis/startequip`, searchObj, signal)
}