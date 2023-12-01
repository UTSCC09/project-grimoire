import React from "react";
import NavBar from "./NavBar";
import {Box, ThemeProvider, Typography, createTheme} from "@mui/material";
import { outlinedInputClasses } from '@mui/material/OutlinedInput';

const theme = createTheme({
    components: {
        MuiTypography: {
          styleOverrides: {
            //Main text, any Typography element will default to this
            root: {
              color: '#ffffff' //white
            },
            h5: {
              color: '#f44336'
            },
            //Default secondary text
            subtitle: {
                color: '#f44336' //red
            }
          },
        },
        MuiGrid: {
            styleOverrides: {
                root:{
                    backgroundColor: '#000000'
                }
            }
        },
        MuiBox:{
          styleOverrides:{
            root:{
              backgroundColor: '#000000'
            }
          }
        },
        MuiAutocomplete: {
            styleOverrides: {
              option: {
                '&[aria-selected="true"]': {
                  backgroundColor: 'black',
                },
      
                '&:hover': {
                  backgroundColor: 'red',
                },
                backgroundColor: 'black',
              },
            },
          },
      },
      palette: {
        primary:
        {
            main: '#ffffff'
        },
        secondary:
        {
            main: '#f44336'
        },
        text:{
          primary: '#ffffff',
          secondary: '#f44336',
          disabled: '#f44336'
        }
    },
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