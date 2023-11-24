import { Box, Button, Card, CardContent, Divider, Grid, Paper, Typography } from "@mui/material";
import React from "react";
import PropTypes from 'prop-types'
import LoadingButton from '@mui/lab/LoadingButton';
import '../characterCreation.css'

function DISComplete(props){
    return(
        <Grid item container xs={12} sx={{width:'100%', minHeight:'100%', display:'flex'}}>
            <Box className="normal-box">
                <Grid item container sx={{height:'10%', width:'100%', marginBottom:"1%", justifyContent:'center', alignItems:'center'}}>
                    <Grid item xs={12}>
                        <Typography align='center'>Your Character So Far</Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <LoadingButton fullWidth variant="contained" disabled={!props.readyToComplete}
                        onClick={props.onComplete} loading={props.isLoading}>Finalize Sheet</LoadingButton>
                    </Grid>
                </Grid>
                <Grid item container xs={12} className="normal-box" spacing={2}>
                    <Grid item container xs={6} className="dis-complete-card">
                        <Paper elevation={3} className="normal-box">
                            <Typography align='center'>General Information</Typography>
                            <Typography>Name*: {props.char.characterName || "No name chosen"}</Typography>
                            <Typography>Background: {props.char.background || "N/A"}</Typography>
                            <Typography>Looks: {props.char.looks || "N/A"}</Typography>
                            <Typography>Drive: {props.char.drive || "N/A"}</Typography>
                            <Typography>Past Allegience: {props.char.pastAllegiance || "N/A"}</Typography>
                            <Typography>Notes: {props.char.notes || "N/A"}</Typography>
                        </Paper>
                    </Grid>

                    <Grid item container xs={6} className="dis-complete-card">
                        <Paper elevation={3} className="normal-box">
                            <Typography align='center'>Origin*</Typography>
                            <Divider/>
                            <Typography>Chosen Origin: {props.char.chosenOrigin}</Typography>
                            <Typography>Chosen Benefit: {props.char.chosenBenefit ? 
                            `${props.char.chosenBenefit.name}: ${props.char.chosenBenefit.description}` : "No Benefit chosen"}</Typography>
                        </Paper>
                    </Grid>

                    <Grid item container xs={6} className="dis-complete-card">
                        <Paper elevation={3} className="normal-box">
                            <Typography align='center'>Stats*</Typography>
                            <Divider/>
                                <Typography>Body: {props.char.stats ? props.char.stats.bdy : "N/A"}</Typography>
                                <Typography>Dexterity: {props.char.stats ? props.char.stats.dex : "N/A"}</Typography>
                                <Typography>Savy: {props.char.stats ? props.char.stats.svy : "N/A"}</Typography>
                                <Typography>Technology: {props.char.stats ? props.char.stats.tech : "N/A"}</Typography>
                        </Paper>
                    </Grid>

                    <Grid item container xs={6} className="dis-complete-card">
                        <Paper elevation={3} className="normal-box">
                            <Typography align='center'>Inventory</Typography>
                            <Divider/>
                            <Typography>Chosen starting Equipment* {props.char.startingEquip? props.char.startingEquip.name : "N/A"}</Typography>
                            <Typography>Items: {props.char.startingEquip && props.char.startingEquip.items.length > 0? 
                                props.char.startingEquip.items.map((i) => i.name).join(', ') : "N/A"}</Typography>
                            <Typography>Weapons: {props.char.startingEquip && props.char.startingEquip.weapons.length > 0? 
                                props.char.startingEquip.weapons.map((i) => i.base.name).join(', ') : "N/A"}</Typography>
                            <Typography>Armor: {props.char.startingEquip && props.char.startingEquip.armor.length > 0? 
                                props.char.startingEquip.armor.map((i) => i.base.name).join(', ') : "N/A"}</Typography>
                        </Paper>
                    </Grid>
                </Grid>
                </Box>
        </Grid>
    )
}

DISComplete.defaultProps = {
    stats: {}
}

export default DISComplete