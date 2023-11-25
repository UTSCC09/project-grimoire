import React from "react";
import NavBar from "./NavBar";
import {Box, ThemeProvider, Typography, createTheme} from "@mui/material";


const theme = createTheme({
    components: {
        MuiTypography: {
          styleOverrides: {
            //Main text, any Typography element will default to this
            root: {
              color: '#ffffff' //white
            },
            //Default secondary text
            subtitle: {
                color: '#ff000d' //red
            }
          },
        },
        MuiGrid: {
            styleOverrides: {
                root:{
                    backgroundcolor: '#000000'
                }
            }
        }
      },
      palette: {
        primary:
        {
            main: '#ffffff'
        },
        secondary:
        {
            main: '#ff000d'
        },
      }
})


function Template(props){
    return(
        <Box>
            <ThemeProvider theme ={theme}>
                <NavBar/>
                {props.children}
            </ThemeProvider>
        </Box>
    )
}

export default Template