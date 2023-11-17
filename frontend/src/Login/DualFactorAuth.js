import {React, useState} from "react"
import {Button, Alert, Grid, Typography, TextField, ThemeProvider, createTheme, Box} from "@mui/material"
import { dualFactorValidate} from "../api.mjs";
import { useNavigate } from "react-router";
import { red } from "@mui/material/colors";
import GrimoireSignUpImage from "../media/GrimoireSignUpImage.png"
import styled from "@emotion/styled";


const theme = createTheme({
    palette: 
    {
        primary:
        {
            main: '#000000'
        },
        secondary:
        {
            main: '#ffffff'
        }

    },
    sizing:
    {
        
        width:
        {
            primary: 'auto'
        },
        display:
        {
            primary: 1
        }
    },
    Button:
    {
        primary: red[500],
        secondary: '#ffffff'
    },
    TextField:
    {
        primary: '#ffffff',
        secondary: red[500]
    },
    Typography:
    {
        primary: '#ffffff',
        secondary: red[500]
    }

})

const CustomTextContainer = styled(Grid)(({theme}) =>({
    width: 'auto',
    backgroundColor: theme.palette.primary.main,
    flex: theme.sizing.display.primary
}))

const CustomSubmitButton = styled(Button)(({theme}) => ({
    fontSize: '200%'
}))



export function DualFactorAuth(props){

    const [validatecode, setvalidatecode] = useState("");
    const [error, seterror] = useState(null);
    const [allowSubmit, setallowSubmit] = useState(false);
    const navigate = useNavigate();

    const handleCodeChange = function (event)
    {
        event.preventDefault();
        if (event.target.value === '')
        {
            setallowSubmit(false);
        }
        else
        {
            setallowSubmit(true);
        }
    }
    
    const handleSubmit = function() {
        dualFactorValidate(validatecode)
        .then(function (response) {
            if (!response.ok)
            {
                if(response.status === 400)
                {
                    seterror("No input was detected. Please insert validation code.")
                }
                if (response.status === 403)
                    seterror("Incorrect validation code");
            }
            else
                navigate("/");
        })
        .catch(function (error) {
            seterror("Connection to the server returned with an error")
            console.log(error);
        });
    }

    return (<ThemeProvider theme={theme}>
    <Grid className="signUpPageCont" spacing={0} container item direction={"row"} xs={12}>
        <img alt="SignUpPicture" className="signUpImage" src={GrimoireSignUpImage}></img>
        <CustomTextContainer spacing={10} item container direction="column" justifyContent={"flex-start"} alignItems={"center"}>
            <Typography marginTop={'40%'} marginBottom={'5%'} color='secondary' fontSize={30} className="signUpPrompt">A validation code has been sent to your Email</Typography>
            <Box container='true' alignContent='center' justifyContent={'center'} width={'75%'} marginBottom={'10%'}>
            <TextField inputProps={{style: {color: "white"}}} className='inputFields' color='secondary' label="Validation Code" variant="filled" focused onChange={e => {handleCodeChange(e); setvalidatecode(e.target.value)}}/>
            </Box>
            {(allowSubmit ? 
            <CustomSubmitButton className="submitButton" color="secondary" onClick={e => {e.preventDefault(); handleSubmit()}}>Sign Up</CustomSubmitButton>
            :
            <Typography fontSize={'5vh'} color='red'>Sign Up</Typography>
            )}
        {
            Boolean(error) ? 
            <Alert severity="error">{error}</Alert>
            : 
            <></>
        }
        </CustomTextContainer>
        </Grid>
        </ThemeProvider>);
}

export default DualFactorAuth;

