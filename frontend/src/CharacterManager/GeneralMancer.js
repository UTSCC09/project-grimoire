import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types'
import {Button, Box, Stepper, StepButton, Step, Grid, Typography, IconButton, Icon } from "@mui/material";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import "./characterCreation.css"

function GeneralMancer(props){
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState({});
    const [steps, setSteps] = useState(props.steps)

    useEffect(() => {
        setSteps(props.steps)
    }, [props.steps])

    const completedSteps = () => {
      return Object.keys(completed).length;
    };
  
    const isLastStep = () => {
      return activeStep === steps.length - 1;
    };
  
    const allStepsCompleted = () => {
      return completedSteps() === steps.length;
    };
  
    const handleNext = () => {
    //   const newActiveStep =
        // isLastStep() && !allStepsCompleted()
        //   ? // It's the last step, but not all steps have been completed,
        //     // find the first step that has been completed
        //     steps.findIndex((step, i) => !(i in completed)) : activeStep + 1
      setActiveStep(Math.min(activeStep + 1, steps.length-1));
    };
  
    const handleBack = () => {
      setActiveStep(Math.max(activeStep - 1, 0));
    };
  
    const handleStep = (step) => () => {
      setActiveStep(step);
    };
  
    const handleComplete = () => {
      const newCompleted = completed;
      newCompleted[activeStep] = true;
      setCompleted(newCompleted);
      handleNext();
    };
  
    const handleReset = () => {
      setActiveStep(0);
      setCompleted({});
    };
  
    return (
      <Grid item container xs={12} className="page-container-cover">
        <Grid item container xs={12} sx={{height:'10%', display:'flex'}}>
            {/* adding the sidebars and main content*/}
            <Grid item container xs={1} className="normal-box-centered">
                <IconButton onClick={handleBack}>
                    <ChevronLeftIcon/>
                </IconButton>
            </Grid>
            <Grid item container xs={10} className="normal-box-centered">
                <Stepper nonLinear activeStep={activeStep} sx={{width:'100%'}}>
                {steps.map((label, index) => (
                    <Step key={label.name} completed={completed[index]}>
                    <StepButton color="inherit" onClick={handleStep(index)}>
                        {label.name}
                    </StepButton>
                    </Step>
                ))}
                </Stepper>
            </Grid>
            <Grid item container xs={1} className="normal-box-centered">
                <IconButton onClick={handleNext}>
                    <ChevronRightIcon/>
                </IconButton>
            </Grid>
        </Grid>
        <Grid item container sx={{height:"90%"}} xs={12}>
            {steps[activeStep].component}
        </Grid>
      </Grid>
    );
}

GeneralMancer.propTypes = {
    steps: PropTypes.arrayOf(PropTypes.object).isRequired,
    
}

export default GeneralMancer