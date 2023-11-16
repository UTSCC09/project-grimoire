import React from "react";
import NavBar from "./NavBar";
import { Box } from "@mui/material";

function Template(props){
    return(
        <Box>
        <NavBar/>
        {props.children}
        </Box>
    )
}

export default Template