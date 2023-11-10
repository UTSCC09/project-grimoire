const URL = process.env.REACT_APP_URL

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
        email: username,
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

export function dualFactorValidate(code)
{
  const post = {
    validation: code
  }
  return fetch(`${URL}/api/validate/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }, 
    body: JSON.stringify(post)})
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

//gets the Current User from the site cookie. Code provided by Prof. Sans
export function getCurrentUser() {
  let username = document.cookie.split("username=")[1];
  if (username.length == 0) return null;
  return username;
}