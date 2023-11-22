import React, { useState } from "react";
import PropTypes from 'prop-types'
import {Button, Box, Stepper, StepButton, Step, Grid, Typography } from "@mui/material";

const steps = ['Select campaign settings', 'Create an ad group', 'Create an ad'];

function DeathInSpaceMancer(props){
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState({});
  
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
      <Box sx={{ width: '100%' }}>
        <Stepper nonLinear activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} completed={completed[index]}>
              <StepButton color="inherit" onClick={handleStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
    );
}

export default DeathInSpaceMancer