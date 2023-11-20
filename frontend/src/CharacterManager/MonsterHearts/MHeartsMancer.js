import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types'
import {Button, Box, Stepper, StepButton, Step, Grid, Typography, IconButton, Icon } from "@mui/material";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import "../characterCreation.css"
import GeneralMancer from "../GeneralMancer";
import MHBasic from "./MHBasic";
import MHMoves from "./MHMoves";
import MHStrings from "./MHStrings";
import MHFinalize from "./MHFinalize";

function MHeartsMancer(props){
    const [char, setChar] = useState({})

    function updateField(key, value){
        const newChar = {...char}
        newChar[key] = value
        setChar(newChar)
    }

    useEffect(() => {
        console.log('charUpdated', char)
    }, [char])

    const steps = [
        {name: 'Basic Character Info', component: <MHBasic onUpdate={updateField} char={char}/>}, 
        {name: 'Choose Your Moves', component: <MHMoves onUpdate={updateField} char={char}/>}, 
        {name: "Add Strings", component: <MHStrings onUpdate={updateField} char={char}/>},
        {name: "Finalize Your Character", component: <MHFinalize onUpdate={updateField} char={char}/>}];
    return (
        <GeneralMancer steps={steps}/>
    )
}

export default MHeartsMancer