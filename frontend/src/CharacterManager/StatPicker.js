import { Box, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { rollNSidedDie } from "../helperFunctions/helper.mjs";
import PropTypes from "prop-types"

function StatPicker(props){
    const NUMSTATS=props.stats.length
    const [rolledArray, setRolledArray] = useState([])
    const [charObj, setCharObj] = useState(props.char || {})

    function saveAndPushCharObj(obj){
        setCharObj(obj)
        console.log('isComplete', isComplete(obj))
        props.onUpdate(obj, false, isComplete(obj))
    }

    function updateChar(key, value){
        const newChar = {...charObj}
        newChar[key] = value
        saveAndPushCharObj(newChar)
    }
    
    function isComplete(obj){
        for(let i = 0; i < NUMSTATS; i++){
            const currStat = props.stats[i].key
            if(!obj.stats || !obj.stats.hasOwnProperty(currStat) || isNaN(Number(obj.stats[currStat])) || obj.stats[currStat] === ""){
                console.log('failing on', currStat)
                return false
            } 
        }
        for(let i = 0; i < props.customRollers.length; i++){
            //if function exists and says input is invalid
            let cRoller = props.customRollers[i]
            if(cRoller.validator && !cRoller.validator(obj[cRoller.key])){
                console.log('failing on', cRoller)
                return false
            }
        }
        return true
    }

    function updateStat(key, value){
        const newCharObj = {...charObj}
        const newStats = newCharObj.stats ? {...newCharObj.stats} : {}
        newStats[key] = value
        newCharObj.stats = newStats
        saveAndPushCharObj(newCharObj)

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
        let newStatObj = charObj.stats ? {...charObj.stats} : {}
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
        const newCharObj = {...charObj}
        newCharObj.stats = newStatObj
        saveAndPushCharObj(newCharObj)
    }

    function clearStats(){
        const newRolled = rolledArray.map((s) => ({value:s.value, assignedStat: undefined}))
        const newCharObj = {...charObj}
        newCharObj.stats = {}
        saveAndPushCharObj(newCharObj)
        setRolledArray(newRolled)
    }

    return(
        <Grid item container xs={12} className={props.className}>
            {props.children ? <>{props.children}</> : <></>}
            <Grid item container xs={12} spacing={1} sx={{justifyContent:'center'}}>
                {props.stats.map((s) => (
                    <Grid item xs={props.widthSx / NUMSTATS}>
                        <TextField type="number" fullWidth label={s.label} value={charObj.stats && charObj.stats.hasOwnProperty([s.key]) ? charObj.stats[s.key] : ""}
                        onChange={(e) => {e.preventDefault(); updateStat(s.key, e.target.value)}}/>
                    </Grid>
                ))}
            </Grid>
            <Grid item container xs={12} sx={{justifyContent:'center'}}>
                <Grid item container xs={12} className="normal-box-centered">
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
                <Grid item container xs={12} sx={{justifyContent:'center'}}>
                    {props.customRollers.map((c) => (
                        <Grid item container xs={props.widthSx / NUMSTATS}>
                            <TextField type="number" fullWidth label={c.label} value={props.char[c.key] || ""}
                                onChange={(e) => {e.preventDefault(); updateChar(c.key, e.target.value)}}/>
                            <Button fullWidth onClick={() => updateChar(c.key, c.roll())}>Roll</Button>
                        </Grid>
                    ))}
                </Grid>
                    <Button fullWidth onClick={rollStats}>Roll Stats</Button>
                    <Button fullWidth onClick={clearStats}>Clear Stats</Button>
                </Grid>
            </Grid>
        </Grid>
    )
}

StatPicker.propTypes = {
    stats: PropTypes.arrayOf(PropTypes.object).isRequired,
    customRollers: PropTypes.arrayOf(PropTypes.object),
    rollStats: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    rolledKey: PropTypes.string,
    widthSx: PropTypes.number,
    char: PropTypes.object,
    className: PropTypes.string
}

StatPicker.defaultProps = {
    widthSx: 8,
    charObj: {},
    customRollers: []
}

export default StatPicker