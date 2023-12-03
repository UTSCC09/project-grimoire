import { Alert, Box, CircularProgress, Grid, Typography} from "@mui/material";
import {React, useState, useEffect} from "react";
import { getSheet } from "../api.mjs";
import { useLocation } from "react-router";
import DeathInSpaceCharacterSheet from "./DeathInSpaceCharacterSheet.js"

function parseID(String)
{
    return ((String.split('/'))[2]);
}


function CharacterSheetView(props){
    const [sheet, setSheet] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);

    const sheetID = parseID(useLocation().pathname);

    useEffect(function () {
        getSheet(sheetID).then(function (response) 
            {
              if (response.ok)
              {
                response.json().then(function (json)
                {
                    setLoading(false)
                    setSheet(json)
                    return
                })
              }
              else 
              {
                setLoading(false)
                setError("Connection to the server cannot be established. Error code " + response.status) 
              }
            })
    }, [])

    return(
        <Grid container justifyContent={'center'} height={'fit-content'}>
            {loading ? <CircularProgress/> : <></>}
            {error ? <Alert severity={'error'}>{error}</Alert> : <></>}
            {sheet ? <CharacterSheet character={sheet}/> : <></>}    
        </Grid>
    )
}

function CharacterSheet(props)
{
    //Need to map the game ID to the actual game which we need a character sheet for
    if (props.character.game.name === "Death In Space")
    {
        return <DeathInSpaceCharacterSheet stats = {props.character}/>
    }
    
    return <></>
}

export default CharacterSheetView