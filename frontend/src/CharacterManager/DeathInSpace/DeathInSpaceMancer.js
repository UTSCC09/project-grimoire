import React, { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types'
import {Button, Box, Stepper, StepButton, Step, Grid, Typography } from "@mui/material";
import GeneralMancer from "../GeneralMancer";
import DISBasic from "./DISBasic";
import DISStats from "./DISStats";
import DISComplete from "./DISComplete";
import DISOrigin from "./DISOrigin";
import DISEquipment from "./DISEquipment";
import { createDISSheet } from "../../api.mjs";
import { useNavigate } from "react-router";

function DeathInSpaceMancer(props){
    const [char, setChar]  = useState({})
    const [readyToComplete, setReadyToComplete] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError]= useState(false)
    const DISRef = useRef()
    const navigate = useNavigate()

    useEffect(()=>{
      console.log('char', char)
    }, [char])

    useEffect(()=>{
      console.log('ready to complete', readyToComplete)
    })

    function completeSheet(){
      setLoading(true)
      //parse the sheet object
      const newChar = {...char}
      newChar.inventory = [...(newChar.inventory || []), ...newChar.startingEquip.items]
      newChar.armor = [...(newChar.armor || []), ...newChar.startingEquip.armor]
      newChar.weapons = [...(newChar.weapons || []), ...newChar.startingEquip.weapons]
      createDISSheet(newChar)
      .then(async (resp) => {
        setLoading(false)
        const json = await resp.json()
        if(!resp.ok){
          setError(json.body)
          console.error(json.body)
          return
        }
        navigate(`../DeathInSpace/sheet/${json._id}`)
      }).catch(e => {
        console.error(e)
        setError("an unexpected Error occured please refresh the page and try again")
      })
    }

    function updateChar(updateObj, navigateNext=false, markComplete=false){
      const newChar = {...char, ...updateObj}
      setChar(newChar)

      
      DISRef.current.handleComplete(markComplete)

      if(navigateNext)
        DISRef.current.handleNext()
    }

    const steps = [
      {name: "General Information", required: true, component: <DISBasic char={char} onUpdate={updateChar}/>},
      {name: "Pick your Origin", required: true, component: <DISOrigin char={char} onUpdate={updateChar}/>},
      {name: "Choose Your Stats", required: true, component: <DISStats char={char} onUpdate={updateChar}/>},
      {name: "Choose Your Equipment", required: true, component: <DISEquipment char={char} onUpdate={updateChar}/>},
      {name: "Finalize Character", component: <DISComplete char={char} onComplete={completeSheet} readyToComplete={readyToComplete} isLoading={loading}/>}
    ]

    return (
      <GeneralMancer steps={steps} ref={DISRef} updateReady={setReadyToComplete}/>
    );
}

export default DeathInSpaceMancer