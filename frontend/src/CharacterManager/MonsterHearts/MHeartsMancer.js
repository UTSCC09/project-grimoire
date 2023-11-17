import React, { useState } from "react";
import PropTypes from 'prop-types'
import {Button, Box, Stepper, StepButton, Step, Grid, Typography, IconButton, Icon } from "@mui/material";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import "../characterCreation.css"

function MHeartsMancer(props){
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState({});

    const steps = ['Basic Character Info', 'Choose Your Skin/Attributes', 'Choose Your Moves', "Add Strings", "Finalize Your Character"];
  
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
      const newActiveStep =
        isLastStep() && !allStepsCompleted()
          ? // It's the last step, but not all steps have been completed,
            // find the first step that has been completed
            steps.findIndex((step, i) => !(i in completed)) : activeStep + 1;
      setActiveStep(newActiveStep);
    };
  
    const handleBack = () => {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
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
      <Grid item container xs={12} className="page-container">
        <Grid item container xs={12} sx={{height:'10%'}}>
            <Stepper nonLinear activeStep={activeStep} sx={{width:'100%'}}>
            {steps.map((label, index) => (
                <Step key={label} completed={completed[index]}>
                <StepButton color="inherit" onClick={handleStep(index)}>
                    {label}
                </StepButton>
                </Step>
            ))}
            </Stepper>
        </Grid>
        <Grid item container sx={{height:"90%"}} xs={12}>
            {/* adding the sidebars and main content*/}
            <Grid item container xs={2} className="basic-box">
                <IconButton>
                    <ChevronLeftIcon/>
                </IconButton>
            </Grid>
            <Grid item container xs={8} className="basic-box">

            </Grid>
            <Grid item container xs={2} className="basic-box">
                <IconButton>
                    <ChevronRightIcon/>
                </IconButton>
            </Grid>
        </Grid>
      </Grid>
    );
}

export default MHeartsMancer