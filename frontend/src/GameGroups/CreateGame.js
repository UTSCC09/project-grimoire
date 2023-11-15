import {React, useState, useEffect} from "react"
import {Button, Grid, TextField, Typography} from "@mui/material"

function CreateGame(props){

    const [gameName, setgameName] = useState(false)
    const [hasLoaded, setLoaded] = useState(false)

    return <Grid>
        <Typography>Create a Game</Typography>
        <TextField id="emailInput" label="Game Name" variant="standard" onChange={e => {e.preventDefault(); props.setEmail(e.target.value)}}/>
        </Grid>
}

export default CreateGame