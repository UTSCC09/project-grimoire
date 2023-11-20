const URL = process.env.REACT_APP_URL

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


// https://stackoverflow.com/questions/2144386/how-to-delete-a-cookie
//Function used for delete_cookie
export function delete_cookie( name, path, domain ) {
  if(document.cookie) {
    document.cookie = name + "=" +
      ((path) ? ";path="+path:"")+
      ((domain)?";domain="+domain:"") +
      ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }
}

// Code used for session testing only
export function getSessionCode() {
  return fetch(`${URL}/test/sessionCode`, {
    method: 'GET',
    credentials: 'include'
    })
}

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

export function getGroups(page=0){
  return fetch(`${URL}/api/groups/page?page=${page}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    credentials: 'include',
  })
}