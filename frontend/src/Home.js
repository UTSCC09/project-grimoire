import { Box, Typography, Menu, createTheme } from "@mui/material";
import {React, useState} from "react";
import NavBar from "./Template/NavBar";
import GrimoireHomePage from "./media/GrimoireHomePage.png";
import "./styling/index.css";
import styled from "@emotion/styled";
import { red } from "@mui/material/colors";


function Home(props){

    return <Box className="textPictureContainer">
        <img alt="Grimoire Home Page" className="homePagePicture" src= {GrimoireHomePage}/>
        <div className="titleMainText">Welcome to Grimoire</div>
        </Box>
    
}

export default Home