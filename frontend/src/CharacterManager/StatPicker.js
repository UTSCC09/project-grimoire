import { Box, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import "./characterCreation.css"
import { rollNSidedDie } from "../helperFunctions/helper.mjs";
import PropTypes from "prop-types"

function StatPicker(props){
    const NUMSTATS=props.stats.length
    const loadedRolled = props.rolledKey && localStorage.getItem(props.rolledKey) ? JSON.parse(localStorage.getItem(props.rolledKey)) : []
    const [rolledArray, setRolledArray] = useState(loadedRolled)
    const [statObj, setStatObj] = useState(props.statObj || {})

    useEffect(() => {
        if(props.statObj != statObj)
            setStatObj(props.statObj)
    }, [props.statObj])

    useEffect(() => {
        if(props.rolledKey)
            localStorage.setItem(props.rolledKey, JSON.stringify(rolledArray))
    }, [rolledArray])
    
    function isComplete(){
        for(let i = 0; i < NUMSTATS; i++){
            const currStat = props.stats[i].key
            if(!statObj.hasOwnProperty(currStat) || typeof statObj[currStat] !== 'number')
                return false 
        }
        return true
    }

    useEffect(() => {
        console.log('isComplete', isComplete())
        props.onUpdate({stats: statObj}, false, isComplete())
    }, [statObj])

    function updateStat(key, value){
        if(isNaN(Number(value)))
            return
        //update stat value
        const newStats = {...statObj}
        newStats[key] = value
        setStatObj(newStats)

        //if a roll was assigned, unassign it
        const newRolled = [...rolledArray]
        for(let i = 0; i < newRolled.length; i++){
            if(newRolled[i].assignedStat === key)
                newRolled[i].assignedStat = undefined
        }
        setRolledArray(newRolled)
    }

    function rollStats(){
        let lastRolled
        let newRolls = []
        for(let i = 0; i < NUMSTATS; i++){
            //in death in space roll 1d4-1d4 to determine score
            lastRolled = props.rollStats()
            newRolls.push({value: lastRolled, assignedStat: undefined})
        }
        setRolledArray(newRolls)
    }

    function chooseRolledStat(index, statKey){
        //check if score has been previously assigned to another stat and clear it
        const newRolled = [...rolledArray]
        let newStatObj = {...statObj}
        //remove whatever was previously assigned to the stat
        delete newStatObj[statKey]

        //have to iterate through index so we can properly remove score
        for(let i=0; i < newRolled.length; i++){
            let s = newRolled[i]
            if(s.assignedStat === statKey){
                s.assignedStat = undefined
                newRolled[i] = s
            }
        }

        const score = newRolled[index]
        newStatObj[statKey] = score.value
        let newScore = {...score}
        newScore.assignedStat = statKey
        newRolled[index] = newScore
        setRolledArray(newRolled)
        setStatObj(newStatObj)
    }

    function clearStats(){
        const newRolled = rolledArray.map((s) => ({value:s.value, assignedStat: undefined}))
        setStatObj({})
        setRolledArray(newRolled)
    }

    return(
        <Grid item container xs={12} className="mancer-page">
            <Grid item container xs={12} spacing={1} sx={{justifyContent:'center'}}>
                {props.stats.map((s) => (
                    <Grid item xs={props.widthSx / NUMSTATS}>
                        <TextField type="number" fullWidth label={s.label} value={statObj.hasOwnProperty([s.key]) ? statObj[s.key] : ""}
                        onChange={(e) => {e.preventDefault(); updateStat(s.key, e.target.value)}}/>
                    </Grid>
                ))}
            </Grid>
            <Grid item container xs={12} sx={{justifyContent:'center'}}>
                <Box className="normal-box-centered">
                {
                    rolledArray.length > 0 ? 
                    <Grid item container xs={12} sx={{justifyContent:'center'}}>
                        {rolledArray.map((a, index) => 
                            <Grid item container xs={props.widthSx / NUMSTATS}>
                                <FormControl fullWidth>
                                <InputLabel>{a.value}</InputLabel>
                                <Select
                                label={a.value}
                                value={a.assignedStat || ""}
                                onChange={(e) => {e.preventDefault(); chooseRolledStat(index, e.target.value)}}>
                                    {props.stats.map((s) => (
                                        <MenuItem value={s.key}>{s.label}</MenuItem>
                                    ))}
                                </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid> : <></>
                }
                    <Button fullWidth onClick={rollStats}>Roll Stats</Button>
                    <Button fullWidth onClick={clearStats}>Clear Stats</Button>
                </Box>
            </Grid>
        </Grid>
    )
}

StatPicker.propTypes = {
    stats: PropTypes.arrayOf(PropTypes.object).isRequired,
    rollStats: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    rolledKey: PropTypes.string,
    widthSx: PropTypes.number,
    statObj: PropTypes.object
}

StatPicker.defaultProps = {
    widthSx: 8,
    statObj: {}
}

export default StatPicker