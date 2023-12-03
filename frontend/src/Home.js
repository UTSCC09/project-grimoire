import { Box, Typography, Menu, createTheme, Grid } from "@mui/material";
import {React, useState} from "react";
import NavBar from "./Template/NavBar";
import GrimoireHomePage from "./media/GrimoireHomePage.png";
import "./styling/index.css";
import styled from "@emotion/styled";
import { red } from "@mui/material/colors";


function Home(props){

    return( 
        <Grid height={'100vh'} container flexDirection={'row'}>
            <Box className="textPictureContainer">
            <img alt="Grimoire Home Page" className="homePagePicture" src= {GrimoireHomePage}/>
            <div className="titleMainText">Welcome to Grimoire</div>
            </Box>
            <Grid width={'30%'} container flexDirection={'column'}>
                <Typography sx={{marginTop: '40%'}} alignSelf={'flex-start'} fontSize={'2rem'} color={'ff0000'}>What is Grimoire?</Typography>
                <Typography width={'100%'} alignSelf={'flex-start'} fontSize={'1.4rem'} color={'ffffff'}>Grimoire is a roleplaying game hub made by gamers, for gamers. Here, you can create gaming groups, find groups for games you like, and manage characters and campaigns. Ready to start? Sign in.</Typography>
            </Grid>
        </Grid>
    )
    
}

export default Home