const URL = process.env.TESTURL

//The following functions return a Promise. The functions which call these ones must
//handle that Promise asynchonously
export function signUp(username, password) 
{
    const postData = {
        username: username,
        password: password
    }
    return fetch(`${URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
    
}


export function logIn(username, password)
{
    const postData = {
        username: username,
        password: password
    }
    return fetch(`${URL}/api/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
}

export function logOut()
{
    return fetch(`${URL}/api/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
}

export function getSheet(ID)
{
    return fetch(`${URL}/api/sheets/${ID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
    })
}

export function deleteSheet(ID)
{
    return fetch(`${URL}/api/sheets/${ID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
    })
}