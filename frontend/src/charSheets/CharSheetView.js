import { Alert, Box, CircularProgress, Grid, Typography} from "@mui/material";
import {React, useState, useEffect} from "react";
import { getSheet } from "../api.mjs";
import { useLocation } from "react-router";
import DeathInSpaceCharacterSheet from "./DeathInSpaceCharacterSheet.js"

function CharacterSheetView(props){
    const [sheet, setSheet] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);
    
    const {state} = useLocation();
    const sheetID = state.charSheetID;

    useEffect(function () {
        getSheet(sheetID).then(function (response) 
            {
              if (response.ok)
              {
                response.json().then(function (json)
                {
                    setLoading(false)
                    console.log(json)
                    setSheet(toString(json))
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
        <Grid height={'100vh'}>
            {loading ? <CircularProgress/> : <></>}
            {error ? <Alert severity={'error'}>{error}</Alert> : <></>}
            {sheet ? <CharacterSheet character={sheet}/> : <></>}    
        </Grid>
    )
}

function CharacterSheet(props)
{
    const DeathInSpaceID = "65380cc7045073574113c6cd";
    //Need to map the game ID to the actual game which we need a character sheet for
    console.log(props)
    if (props.character.game === DeathInSpaceID)
    {
        
        return <DeathInSpaceCharacterSheet stats = {props.sheet}/>
    }
    
    return <></>
}

export default CharacterSheetView