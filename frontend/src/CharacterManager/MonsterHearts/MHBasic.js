import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types'
import { Card, CardActions, CardContent, CardMedia, Collapse, FormControlLabel, Grid, Switch, TextField, Typography } from "@mui/material";
import "../characterCreation.css"
import { getSkins } from "../../api.mjs";
import ExpandMore from "../../globalComponents/ExpandMore";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function SkinCard(props){
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        console.log('expanded', expanded)
    }, [expanded])

    return (
        <Card>
            <CardMedia/>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {props.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {props.description}
                </Typography>
            </CardContent>
            <CardActions>
                <ExpandMore expanded={expanded} onClick={() => setExpanded(!expanded)}>
                    <ExpandMoreIcon/>
                </ExpandMore>
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                <Typography subtitle>Skills:</Typography>
                <Typography subtitle>Moves:</Typography>
                <Typography subtitle>Advancements:</Typography>
                    <Typography paragraph>
                        {props.advancements.map(a => a.desc).join()}
                    </Typography>
                <Typography subtitle>Sex Move:</Typography>
                    <Typography paragraph>
                        {props.sexMove}
                    </Typography>
                </CardContent>
            </Collapse>
        </Card>
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
            console.log('json', json)
            setSkins(json.records)
        }).catch(e => {
            console.error(e)
            if(e.name !== 'AbortError'){
                setError("Test")
            }
        })
    }, [])

    return(
        <Grid item container xs={12} className="mancer-page">
            <Grid item container xs={12} sx={{justifyContent:'center'}}>
                <Grid item>
                    <TextField label="Character Name"/>
                </Grid>
                <Grid item>
                    <FormControlLabel control={<Switch />} label="Enable Homebrew ⚗️" />
                </Grid>
            </Grid>
            <Grid item container xs={12}>
                <Typography>Choose your skin</Typography>
                {skins.map((s) => (
                    <SkinCard {...s}/>
                ))}
            </Grid>
            
        </Grid>
    )
}

export default MHBasic