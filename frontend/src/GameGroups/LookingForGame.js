import {React, useState, useEffect} from "react"
import {Button} from "@mui/material"

function LookingForGame(props){

    const [success, setSuccess] = useState(false)
    const [hasLoaded, setLoaded] = useState(false)
    const [error, setError] = useState(false)
    const [items, setItems] = useState([])

    useEffect(() => {
        if(!hasLoaded){
            // fetch paginated list of groups based on search parameters
            fetch("/api/groups/page", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then((res) => {
                if(res.status === 200){
                    res.json().then((json) => {
                        setItems(json)
                        setLoaded(true)
                    })
                } else {
                    setError(true)
                }
            })
        }
    })

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
                                <p>Location: {item.location}</p>
                                <p>Preferences: {item.preferences}</p>
                                <Button onClick={() => setSuccess(true)}>Join Group</Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    ReactDOM.render(
        <LookingForGame />,
        document.getElementById("root")
    )
}

export default LookingForGame