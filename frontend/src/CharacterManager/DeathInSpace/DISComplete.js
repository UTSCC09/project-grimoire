import { Box, Button, Card, CardContent, Divider, Grid, Paper, Typography } from "@mui/material";
import React from "react";
import PropTypes from 'prop-types'
import LoadingButton from '@mui/lab/LoadingButton';
import '../characterCreation.css'
import { dividerStyle } from "../../Template/Template";

function DISComplete(props){

    return(
        <Grid item container xs={12} spacing={1} className="mancer-page">
            <Grid item container xs={12} className="center">
                <Grid item xs={12}>
                    <Typography align='center'>Your Character So Far</Typography>
                </Grid>
                <Grid item xs={3}>
                    <LoadingButton fullWidth variant="contained" disabled={!props.readyToComplete}
                    onClick={props.onComplete} loading={props.isLoading}>Finalize Sheet</LoadingButton>
                </Grid>
            </Grid>
            <Grid item container xs={12} spacing={2}>
                <Grid item container xs={6}>
                    <Paper elevation={3} className="dis-complete-card">
                        <Typography align='center'>General Information</Typography>
                        <Divider/>
                        <Typography>Name*: {props.char.characterName || "No name chosen"}</Typography>
                        <Typography>Background: {props.char.background || "N/A"}</Typography>
                        <Typography>Looks: {props.char.looks || "N/A"}</Typography>
                        <Typography>Drive: {props.char.drive || "N/A"}</Typography>
                        <Typography>Past Allegience: {props.char.pastAllegiance || "N/A"}</Typography>
                        <Typography>Notes: {props.char.notes || "N/A"}</Typography>
                    </Paper>
                </Grid>

                <Grid item container xs={6}>
                    <Paper elevation={3} className="dis-complete-card">
                        <Typography align='center'>Origin*</Typography>
                        <Divider/>
                        <Typography>Chosen Origin: {props.char.chosenOrigin}</Typography>
                        <Typography>Chosen Benefit: {props.char.chosenBenefit ? 
                        `${props.char.chosenBenefit.name}: ${props.char.chosenBenefit.description}` : "No Benefit chosen"}</Typography>
                        <Typography>Mutations: {props.char.mutationObjs ? props.char.mutationObjs.map((m) => m.name).join(', ') : "N/A"}</Typography>
                    </Paper>
                </Grid>

                <Grid item container xs={6}>
                    <Paper elevation={3} className="dis-complete-card">
                        <Typography align='center'>Stats*</Typography>
                        <Divider/>
                            <Typography>Body: {props.char.stats ? props.char.stats.bdy : "N/A"}</Typography>
                            <Typography>Dexterity: {props.char.stats ? props.char.stats.dex : "N/A"}</Typography>
                            <Typography>Savy: {props.char.stats ? props.char.stats.svy : "N/A"}</Typography>
                            <Typography>Technology: {props.char.stats ? props.char.stats.tech : "N/A"}</Typography>
                            <Typography>Hit Points: {props.char.hitPoints ? props.char.hitPoints: "N/A"}</Typography>
                    </Paper>
                </Grid>

                <Grid item container xs={6}>
                    <Paper elevation={3} className="dis-complete-card">
                        <Typography align='center'>Inventory</Typography>
                        <Divider/>
                        <Typography>Holos: {props.char.holos || "N/A"}</Typography>
                        <Typography>Chosen starting Equipment* {props.char.startingEquip? props.char.startingEquip.name : "N/A"}</Typography>
                        <Typography>Items: {props.char.inventory && props.char.inventory.length > 0? 
                            props.char.inventory.map((i) => i.name).join(', ') : "N/A"}</Typography>
                        <Typography>Weapons: {props.char.weapons && props.char.weapons.length > 0? 
                            props.char.weapons.map((i) => i.base.name).join(', ') : "N/A"}</Typography>
                        <Typography>Armor: {props.char.armor && props.char.armor.length > 0? 
                            props.char.armor.map((i) => i.base.name).join(', ') : "N/A"}</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Grid>
    )
}

DISComplete.defaultProps = {
    stats: {}
}

export default DISComplete