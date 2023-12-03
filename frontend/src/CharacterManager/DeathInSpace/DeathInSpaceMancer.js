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
import { useLocation, useNavigate } from "react-router";
import ErrorAlert from "../../globalComponents/ErrorAlert";

function DeathInSpaceMancer(props){
    const [char, setChar]  = useState({})
    const [readyToComplete, setReadyToComplete] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError]= useState(false)
    const DISRef = useRef()

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(()=>{
      if(char.functions && char.functions.markComplete !== 'ignore')
        DISRef.current.handleComplete(char.functions.markComplete)

      if(char.functions && char.functions.navigateNext)
        DISRef.current.handleNext()
    }, [char])

    function formatChar(){
      const newChar = {...char}
      if(newChar.startingEquip){
        newChar.inventory = [...(newChar.inventory || []), ...newChar.startingEquip.items]
        newChar.armor = [...(newChar.armor || []), ...newChar.startingEquip.armor]
        newChar.weapons = [...(newChar.weapons || []), ...newChar.startingEquip.weapons]
      }

      //add starting bonus
      if(newChar.startingBonus){
        const sbKey = newChar.startingBonus.startingBonus.key
        if(sbKey === 'hitPoints'){
          newChar.hitPoints += 3
        }else{
          newChar[sbKey] = [...(newChar[sbKey] || []), ...newChar.startingBonus[sbKey]]
        }
        if(sbKey === 'mutations')
          newChar.mutationObjs = [newChar.startingBonus.startingBonus]
      }
      return newChar
    }

    function completeSheet(){
      setLoading(true)
      //parse the sheet object
      const newChar = formatChar()

      createDISSheet(newChar)
      .then(async (resp) => {
        setLoading(false)
        const json = await resp.json()
        if(!resp.ok){
          if(resp.status === 401){
            navigate("/login", {state: {path: location.pathname}})
          }
          setError(json.body)
          return
        }
        navigate(`/sheets/${json._id}`)
      }).catch(e => {
        console.error(e)
        setError("an unexpected Error occured please refresh the page and try again")
      })
    }

    function updateChar(updateObj, navigateNext=false, markComplete=false){
      const newChar = {...char, ...updateObj}
      newChar.functions = {
        markComplete,
        navigateNext
      }
      setChar(newChar)
    }

    const steps = [
      {name: "General Information", required: true, component: <DISBasic char={char} onUpdate={updateChar}/>},
      {name: "Pick your Origin", required: true, component: <DISOrigin char={char} onUpdate={updateChar}/>},
      {name: "Choose Your Stats", required: true, component: <DISStats char={char} onUpdate={updateChar}/>},
      {name: "Choose Your Equipment", required: true, component: <DISEquipment char={char} onUpdate={updateChar}/>},
      {name: "Finalize Character", component: <DISComplete char={formatChar()} onComplete={completeSheet} readyToComplete={readyToComplete} isLoading={loading}/>}
    ]

    return (
      <>
      <GeneralMancer steps={steps} ref={DISRef} updateReady={setReadyToComplete}/>
      <ErrorAlert open={Boolean(error)} error={error} onClose={() => setError("")}/>
      </>
    );
}

export default DeathInSpaceMancer