import { Box, Typography, Menu } from "@mui/material";
import {React, useState} from "react";
import NavBar from "./Template/NavBar";

function Home(props){

    return(
        <NavigationMenu>
            <Typography>This is the Home page</Typography>
        </NavigationMenu>
    )
}

function NavigationMenu(props)
{
    const [dialog, setDialog] = useState(false)
    return (
        <Menu open = {false}>UwU</Menu>
    )
}

export default Home