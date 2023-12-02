import React from "react";
import NavBar from "./NavBar";
import {Box, ThemeProvider, Typography, createTheme} from "@mui/material";
import { outlinedInputClasses } from '@mui/material/OutlinedInput';

export const dividerStyle = {background:'red', margin:'0.5%', marginBottom:'1.5%'}

const primary = '#ffffff'
const secondary = '#f44336'
const background = '#000000'
const disabled = "#5E1A1D"

const theme = createTheme({
    components: {
        MuiTypography: {
          styleOverrides: {
            //Main text, any Typography element will default to this
            root: {
              color: primary //white
            },
            h5: {
              color: secondary
            },
            //Default secondary text
            subtitle: {
                color: secondary //red
            }
          },
        },
        MuiGrid: {
            styleOverrides: {
                root:{
                    backgroundColor: background
                }
            }
        },
        MuiBox:{
          styleOverrides:{
            root:{
              backgroundColor: background
            }
          }
        },
        MuiAutocomplete: {
            styleOverrides: {
              option: {
                '&[aria-selected="true"]': {
                  backgroundColor: background,
                },
      
                '&:hover': {
                  backgroundColor: secondary,
                },
                backgroundColor: background,
              },
            },
        },
        //consulted https://stackoverflow.com/a/58963947 for themeing a textfield
        MuiTextField: {
          styleOverrides: {
            root: {
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: primary
              },
              "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: secondary
              },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: secondary
              },
              "& .MuiOutlinedInput-input": {
                color: primary
              },
              "&:hover .MuiOutlinedInput-input": {
                color: secondary
              },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {
                color: secondary
              },
              "& .MuiInputLabel-outlined": {
                color: primary
              },
              "&:hover .MuiInputLabel-outlined": {
                color: secondary
              },
              "& .MuiInputLabel-outlined.Mui-focused": {
                color: secondary
              }
            }
          }
        },
        MuiCardContent:{
          styleOverrides:{
            root:{
              backgroundColor: background,
            }
          }
        },
        MuiDialogContent:{
          styleOverrides:{
            root:{
              backgroundColor: background,
            }
          }
        },
        MuiDialogTitle:{
          styleOverrides:{
            root:{
              backgroundColor: background,
            }
          }
        },
        MuiDialogActions:{
          styleOverrides:{
            root:{
              backgroundColor: background,
            }
          }
        },
        MuiPaper:{
          styleOverrides:{
            root:{
              backgroundColor: background
            }
          }
        },
        MuiDivider:{
          styleOverrides:{
            root:{
              background:secondary,
              margin:'0.5%',
              marginBottom:'1.5%'
            }
          }
        },
      },
      palette: {
        primary:
        {
            main: primary
        },
        secondary:
        {
            main: secondary
        },
        action:{
          disabled: primary,
          disabledBackground: disabled
        },
        text:{
          primary: primary,
          secondary: secondary,
          disabled: disabled
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