import { Grid, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import "../characterCreation.css"

function DISBasic(props){
    const [currChar, setCurrChar] = useState(props.char)

    useEffect(()=>{
        props.onUpdate(currChar, false, Boolean(currChar.characterName))
    }, [currChar])

    function updateChar(key, value){
        const newChar = {...currChar}
        newChar[key] = value
        setCurrChar(newChar)
    }

    return (
        <Grid item container xs={12} className="page-container-cover">
            <TextField label="Character Name" required
                onChange={(e) => {e.preventDefault(); updateChar('characterName', e.target.value)}} value={props.char.characterName}/>
            <TextField label="Character Background" value={props.char.background}
                onChange={(e) => {e.preventDefault(); updateChar('background', e.target.value)}}/>
            <TextField label="Character Looks" value={props.char.looks}
                onChange={(e) => {e.preventDefault(); updateChar('looks', e.target.value)}}/>
            <TextField label="Character Drive" value={props.char.drive}
                onChange={(e) => {e.preventDefault(); updateChar('drive', e.target.value)}}/>
            <TextField label="Past Allegience" value={props.char.pastAllegiance}
                onChange={(e) => {e.preventDefault(); updateChar('pastAllegiance', e.target.value)}}/>
            <TextField multiline label="Notes" value={props.char.notes} rows={4}
                onChange={(e) => {e.preventDefault(); updateChar('notes', e.target.value)}}/>
        </Grid>
    )
}

export default DISBasic;