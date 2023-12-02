import React from "react";
import PropTypes from 'prop-types'
import { Grid } from "@mui/material";

function GridBreak(props){
    return (<Grid item xs={props.gridSize}/>)
}

GridBreak.propTypes={
    gridSize: PropTypes.number
}

GridBreak.defaultProps={
    gridSize: 12
}


export default GridBreak