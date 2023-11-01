import React from "react";
import {Box, Typography, Grid, Button} from '@mui/material'
import "./template.css"

function NavBar(props){
    return(
    <Box className="basic-box">
        <Grid item container xs={2} className='logo-box'>
            <Button variant="text" className="nav-button" >Grimoire</Button>
        </Grid>
        <Grid item container xs={10} className="nav-box">
            <Button variant="text" className="nav-button">Death In Space</Button>
            <Button variant="text" className="nav-button">Monster Hearts</Button>
        </Grid>
        <Grid item container xs={2}>

        </Grid>
    </Box>
    )
}

export default NavBar