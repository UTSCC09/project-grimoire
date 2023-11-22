import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types'
import { Card, CardActionArea, CardActions, CardContent, CardMedia, Collapse, Dialog, DialogActions, 
    DialogContent, DialogTitle, FormControlLabel, Grid, List, Modal, Paper, Radio, Button,
    RadioGroup, Switch, TextField, Typography } from "@mui/material";
import "../characterCreation.css"
import { getSkins } from "../../api.mjs";
import ExpandMore from "../../globalComponents/ExpandMore";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const parseStats = (stat) => {
    delete stat._id
    let str = ""
    for(const key in stat){
        str += `${key}: ${stat[key]} `
    }

    return str
}

function SkinCard(props){
    const [expanded, setExpanded] = useState(false)
    const [selectedStat, setSelectedStat] = useState(0)

    const onClose = (event) =>{
        if(event)
            event.preventDefault();
        setExpanded(false)
    }

    function updateMancer(){
        props.onUpdate({
            skin: props._id,
            selectedStat: selectedStat,
            moves: [...(props.char.moves || []), ...props.requiredMoves]
        })
        onClose()
    }

    return (
        <>
        <Card>
            <CardMedia/>
            <CardActionArea>
                <CardContent onClick={() => {setExpanded(true)}}>
                    <Typography gutterBottom variant="h5" component="div">
                        {props.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {props.description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
        <Dialog onClose={onClose} open={expanded} maxWidth="sm" fullWidth>
            <DialogTitle>{props.name}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary">
                    {props.description}
                </Typography>
                <Grid item container xs={12}>
                    <Typography>Darkest Self</Typography>
                    {props.darkestSelf}
                </Grid>
                <Grid item container xs={12}>
                    <Typography>Stats</Typography>
                    <RadioGroup
                    value={selectedStat}
                    onChange={(e) => {e.preventDefault(); setSelectedStat(e.target.value)}}
                    >
                    {props.statOptions.map((s, index) => (
                        <FormControlLabel value={index} control={<Radio />} label={parseStats(s)}/>
                    ))}
                </RadioGroup>
                </Grid>
                <Grid item container xs={12}>
                    <Typography>Moves</Typography>
                    {/* {props.moves.map((m) => <Typography>{m}</Typography>)} */}
                </Grid>
                <Grid item container xs={12}>
                    <Typography>Sex Move</Typography>
                    {props.sexMove}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Go Back</Button>
                <Button onClick={updateMancer}>Choose This Skin</Button>
            </DialogActions>
        </Dialog>
        </>
    )
}

function MHBasic(props){
    const [skins, setSkins] = useState([])
    const [skinSearch, setSkinSearch] = useState({})
    const [error, setError] = useState("")

    useEffect(() => {
        const controller = new AbortController()
        getSkins(skinSearch, controller.signal).then(async resp => {
            if(!resp.ok){
                console.log('resp not ok')
                return
            }
            const json = await resp.json()
            //console.log('json', json)
            setSkins(json.records)
        }).catch(e => {
            console.error(e)
            if(e.name !== 'AbortError'){
                setError("Test")
            }
        })
    }, [])

    return(
        <Grid item container xs={12} className="mancer-page" spacing={2}>
            <Grid item container xs={12} sx={{justifyContent:'center'}}>
                <Grid item>
                    <TextField label="Character Name"/>
                </Grid>
                <Grid item>
                    <FormControlLabel control={<Switch />} label="Enable Homebrew ⚗️" />
                </Grid>
            </Grid>
            <Grid item container xs={12} spacing={1} sx={{padding:"0.5%"}}>
                    {skins.map((s) => (
                        <Grid item container xs={12}>
                            <SkinCard {...s} onUpdate={props.onUpdate} char={props.char}/>
                        </Grid>
                    ))}
            </Grid>
        </Grid>
    )
}

export default MHBasic