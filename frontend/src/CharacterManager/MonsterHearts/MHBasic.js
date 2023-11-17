import React from "react";
import PropTypes from 'prop-types'
import { Grid, Typography } from "@mui/material";
import { Button } from "@mui/base";

function MHBasic(props){
    return(
        <Grid>
            <Typography>
                Fill out your basic info
            </Typography>
            <Button onClick={(e) => {e.preventDefault(); props.onClick('name', 'test')}}>
                Test
            </Button>
        </Grid>
    )
}

export default MHBasic