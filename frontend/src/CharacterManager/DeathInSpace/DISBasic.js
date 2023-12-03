import { Box, Grid, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import "../characterCreation.css"
import '../../styling/general.css'

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
            <Box className="fill">
            <Grid item container xs={12} spacing={1} sx={{marginBottom:'2%'}}>
                <Grid item xs={3}>
                    
                <TextField label="Character Name" required fullWidth
                    onChange={(e) => {e.preventDefault(); updateChar('characterName', e.target.value)}} value={props.char.characterName}/>
                </Grid>
            </Grid>
            <Grid item container xs={12} spacing={1} className="center">
                <Grid item xs={3}>
                <TextField label="Character Background" value={props.char.background} fullWidth
                    onChange={(e) => {e.preventDefault(); updateChar('background', e.target.value)}}/>
                </Grid>
                <Grid item xs={3}>
                <TextField label="Character Looks" value={props.char.looks} fullWidth
                    onChange={(e) => {e.preventDefault(); updateChar('looks', e.target.value)}}/>
                </Grid>
                <Grid item xs={3}>
                <TextField label="Character Drive" value={props.char.drive} fullWidth
                    onChange={(e) => {e.preventDefault(); updateChar('drive', e.target.value)}}/>
                </Grid>
                <Grid item xs={3}>
                    <TextField label="Past Allegience" value={props.char.pastAllegiance} fullWidth
                        onChange={(e) => {e.preventDefault(); updateChar('pastAllegiance', e.target.value)}}/>
                </Grid>
                <Grid item xs={6}>
                    <TextField multiline label="Notes" value={props.char.notes} rows={4} fullWidth
                        onChange={(e) => {e.preventDefault(); updateChar('notes', e.target.value)}}/>
                </Grid>
            </Grid>
            </Box>
            
        </Grid>
    )
}

export default DISBasic;