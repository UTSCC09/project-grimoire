import { Box, Button, Grid, Select, TextField } from "@mui/material";
import React, { useState } from "react";
import "../characterCreation.css"
import { rollNSidedDie } from "../../helperFunctions/helper.mjs";
import StatPicker from "../StatPicker";
import "../characterCreation.css"

function DISStats(props){
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
            validator: (num) => {console.log('test', num, isNaN(Number(num))); return !isNaN(Number(num))}
        }
    ]

    return (
        <StatPicker rollStats={() => rollNSidedDie(4) - rollNSidedDie(4)} rolledKey="DISRolled" className="mancer-page"
        stats={stats} onUpdate={props.onUpdate} char={props.char}
        customRollers={customRollers}
        />
    )
}

export default DISStats