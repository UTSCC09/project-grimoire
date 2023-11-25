import { Box, Button, Divider, Grid, Paper, Select, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import "../characterCreation.css"
import { isObjectEmpty, rollNSidedDie } from "../../helperFunctions/helper.mjs";
import StatPicker from "../StatPicker";
import "../characterCreation.css"
import { getStartingBonus } from "../../api.mjs";

function DISStats(props){
    const [startingBonus, setStartingBonus] = useState(props.char.startingBonus || {})
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const stats = [
        {
            label : "Body",
            key: "bdy"
        },
        {
            label: "Dexterity",
            key: "dex"
        },
        {
            label: "Savy",
            key: "svy"
        },
        {
            label: "Technology",
            key: "tech"
        }
    ]

    const customRollers = [
        {
            key : "hitPoints",
            label: "Hit Points",
            roll: () => rollNSidedDie(8),
            validator: (num) => !isNaN(Number(num))
        },
        {
            key: 'holos',
            label: "Holos",
            roll: () => rollNSidedDie(10) + rollNSidedDie(10) + rollNSidedDie(10),
            validator: (num) => !isNaN(Number(num))
        }
    ]

    function areStatsLow(){
        let sum = 0
        for(let i = 0; i < stats.length; i++){
            let currStat = stats[i].key
            if(!props.char.stats || props.char.stats[currStat] === undefined)
                return false
            sum += Number(props.char.stats[currStat])
        }
        return sum < 0
    }

    useEffect(()=>{
        const abortCont = new AbortController()
        const finish = () => abortCont.abort()
        if(!areStatsLow()){
            setStartingBonus({})
            props.onUpdate({startingBonus: undefined}, false, 'ignore')
            return finish
        }
        //if already have a bonus
        if(!isObjectEmpty(startingBonus))
            return finish
        console.log('adding bonus')
        getStartingBonus(abortCont.signal)
        .then(async (resp) => {
            const json = await resp.json()
            if(!resp.ok){
                console.error(json.body)
                setError(json.body)
                return
            }
            setStartingBonus(json)
            props.onUpdate({startingBonus: json}, false, 'ignore')
        }).catch(e => {
            if(e.name !== 'AbortError'){
                console.error(e)
                setError("an unexpected Error occured please refresh the page and try again")
                setLoading(false)
            }
        })
        return finish
    }, [props.char.stats])

    return (
        <StatPicker rollStats={() => rollNSidedDie(4) - rollNSidedDie(4)} rolledKey="DISRolled" className="mancer-page"
        stats={stats} onUpdate={props.onUpdate} char={props.char}
        customRollers={customRollers}>
            {!isObjectEmpty(startingBonus) ? 
            <Paper elevation={1} className='cenetered' sx={{margin:'1%'}}>
                    UH-oh! your stats are low, we've randomly chosen to add the following to your character sheet.
                <Divider/>
                    <Typography>Type: {startingBonus.startingBonus.type}</Typography>
                <Typography>
                    Name: {startingBonus.startingBonus.name}
                </Typography>
                <Typography>
                    Description: {startingBonus.startingBonus.description}
                </Typography>
            </Paper>
            : <></>}
        </StatPicker>
    )
}

export default DISStats