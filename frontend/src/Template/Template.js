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
        MuiTextField:{
          styleOverrides:{
            root:{
              borderColor: '#ffffff'
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
      MuiTextField: {
        styleOverrides: {
          root: {
            '--TextField-brandBorderColor': '#f44336',
            '--TextField-brandBorderHoverColor': '#f44336',
            '--TextField-brandBorderFocusedColor': '#f44336',
            '& label.Mui-focused': {
              color: 'var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: 'var(--TextField-brandBorderColor)',
          },
          root: {
            [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: 'var(--TextField-brandBorderHoverColor)',
            },
            [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: 'var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            '&:before, &:after': {
              borderBottom: '2px solid var(--TextField-brandBorderColor)',
            },
            '&:hover:not(.Mui-disabled, .Mui-error):before': {
              borderBottom: '2px solid var(--TextField-brandBorderHoverColor)',
            },
            '&.Mui-focused:after': {
              borderBottom: '2px solid var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
      MuiInput: {
        styleOverrides: {
          root: {
            '&:before': {
              borderBottom: '2px solid var(--TextField-brandBorderColor)',
            },
            '&:hover:not(.Mui-disabled, .Mui-error):before': {
              borderBottom: '2px solid var(--TextField-brandBorderHoverColor)',
            },
            '&.Mui-focused:after': {
              borderBottom: '2px solid var(--TextField-brandBorderFocusedColor)',
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
          secondary: '#f44336'
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