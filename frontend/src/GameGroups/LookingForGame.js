import React, {useState, useEffect} from "react"
import {Button} from "@mui/material"
import { getGroups } from "../api.mjs"

function getPrefString(prefObj){
    let str = ""
    for(let key in prefObj){
        str += `${key}: ${prefObj[key]} `
    }
    return str
}

function LookingForGame(props){

    const [success, setSuccess] = useState(false)
    const [hasLoaded, setLoaded] = useState(false)
    const [error, setError] = useState(false)
    const [items, setItems] = useState([])
    const [page, setPage] = useState(0)

    useEffect(() => {
        if(!hasLoaded){
            // fetch paginated list of groups based on search parameters
            getGroups(page)
            .then((res) => {
                if(res.ok){
                    res.json().then((json) => {
                        setItems(json)
                        setLoaded(true)
                    })
                } else {
                    setError(true)
                }
            }).catch(e => console.error(e))
        }
    }, [])

    if (error) {
        return <div>Error: could not load groups</div>
    } else if (!hasLoaded) {
        return <div>Loading...</div>
    } else {
        return (
            // display list of groups
            <div className="wrapper">
                <ul className="list">
                    {items.map((item) => (
                        <li key={item._id}>
                            <div className="list-item">
                                <h3>{item.name}</h3>
                                <p>Owner: {item.owner}</p>
                                <p>Members: {item.members}</p>
                                <p>Game: {item.game}</p>
                                {/* <p>Location: {item.location}</p> */}
                                <p>Preferences: {getPrefString(item.preferences)}</p>
                                <Button onClick={() => setSuccess(true)}>Join Group</Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
}

export default LookingForGame