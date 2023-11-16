import React from "react";
import NavBar from "./NavBar";
import {Box, ThemeProvider, createTheme} from "@mui/material";
import { red } from "@mui/material/colors";

const mainTheme = createTheme({
    palette: {
        primary: {
            main: '#000000', 
        },
        secondary: {
            main: '#7289da'
        },
        textColorPrimary:
        {
            main: '#ffffff'
        },
        textColorSecondary:
        {
            main: red[500]
        }
    },
    fontColor: {
        primary:{
            main: red[500],
        }
    }
})


function Template(props){
    return(
        <Box>
            <ThemeProvider theme ={mainTheme}>
                <NavBar/>
                <div className="navBarSpacer"></div>
                {props.children}
            </ThemeProvider>
        </Box>
    )
}

export default Template