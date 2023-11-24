import { Box, Button, Grid, Select, TextField } from "@mui/material";
import React, { useState } from "react";
import "../characterCreation.css"
import { rollNSidedDie } from "../../helperFunctions/helper.mjs";
import StatPicker from "../StatPicker";

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

    return (
        <StatPicker rollStats={() => rollNSidedDie(4) - rollNSidedDie(4)} rolledKey="DISRolled"
        stats={stats} onUpdate={props.onUpdate} statObj={props.char.stats || {}}/>
    )
}

export default DISStats