import React, { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types'
import {Button, Box, Stepper, StepButton, Step, Grid, Typography } from "@mui/material";
import GeneralMancer from "../GeneralMancer";
import DISBasic from "./DISBasic";
import DISStats from "./DISStats";
import DISComplete from "./DISComplete";
import DISOrigin from "./DISOrigin";

const steps = ['Select campaign settings', 'Create an ad group', 'Create an ad'];

function DeathInSpaceMancer(props){
    const [char, setChar]  = useState({})
    const DISRef = useRef()

    useEffect(()=>{
      console.log('char', char)
    }, [char])

    function updateChar(updateObj, navigateNext=false, markComplete=false){
      const newChar = {...char, ...updateObj}
      setChar(newChar)

      if(markComplete)
        DISRef.current.handleComplete()

      if(navigateNext)
        DISRef.current.handleNext()
    }

    const steps = [
      {name: "General Information", component: <DISBasic char={char} onUpdate={updateChar}/>},
      {name: "Pick your Origin/Equipment", component: <DISOrigin char={char} onUpdate={updateChar}/>},
      {name: "Choose Your Stats", component: <DISStats char={char} onUpdate={updateChar}/>},
      {name: "Finalize Character", component: <DISComplete char={char} onUpdate={updateChar}/>}
    ]

    return (
      <GeneralMancer steps={steps} ref={DISRef}/>
    );
}

export default DeathInSpaceMancer