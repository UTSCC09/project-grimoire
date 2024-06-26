import {React, useState} from "react"
import {Button, TextField, Alert, Grid, ThemeProvider, createTheme, Typography, Box, Checkbox, FormControlLabel, CheckBoxIcon, Link} from "@mui/material"
import {useNavigate} from "react-router-dom"
import { signUp, getSessionCode } from "../api.mjs";
import GrimoireSignUpImage from "../media/GrimoireSignUpImage.png"
import "./signUp.css";
import styled from "@emotion/styled";
import { red } from "@mui/material/colors"; 
import { isValidEmail } from "../helperFunctions/helper.mjs";

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
    maxWidth: '40%',
    height: '105vh',
    backgroundColor: theme.palette.primary.main,
    flex: theme.sizing.display.primary
}))

const CustomSubmitButton = styled(Button)(({theme}) => ({
    fontSize: '200%'
}))

function SignUp(props){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    return <SignUpForm setEmail = {setEmail} setPassword = {setPassword} email = {email} password = {password}/>
}

function SignUpForm(props)
{
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [allowSubmit, setallowSubmit] = useState(false);
    const [DualFactor, setDualFactor] = useState(false)
    
    const handleDualFactorClick = function(event)
    {
        event.preventDefault();
        setDualFactor(event.target.checked);
        console.log(event.target.checked)
    }

    const handleEmailChange = function (event)
    {
        event.preventDefault();
        if (isValidEmail(event.target.value))
        {
            props.setEmail(event.target.value); 
            setallowSubmit(true);
        }
        else
        {
            setallowSubmit(false);
        }
    }
    const FormSubmit = function () 
    {
        if (props.email === '' || props.password === '')
        {
            setError("Please fill in both fields.")
        }
        else if (!isValidEmail(props.email))
        {
            setError("Email field needs to be a valid email");
        }
        else 
        {
            setError(null);
            signUp(props.email, props.password, DualFactor).then(function (response) 
            {
                
                if (!response.ok)
                {
                    if (response.status === 409)
                        setError("Email is already in use");
                    else
                        throw new Error(`POST /signup error. Status return is ${response.status}. No error info available`);
                }
                else
                    navigate("/DualFactorAuth");
            })
            .catch(function (error)
            {
                setError("Connection could not be made to the server.");
                console.log("Error: " + error);
            });
        }
    }
    
    return (
    <ThemeProvider theme={theme}>
    <Grid sx={{backgroundColor: '#000000'}} spacing={0} container item direction={"row"} xs={12}>
        <div className="imgcontainer">
            <img alt="SignUpPicture" style={{maxHeight: '100%', maxWidth: '100%'}} src={GrimoireSignUpImage}/>
        </div>
        <CustomTextContainer spacing={3} item container direction="column" justifyContent={"flex-start"} alignItems={"center"}>
            <Typography marginTop={'20%'} marginBottom={'5%'} color='secondary' fontSize={80} className="signUpPrompt">Join Us</Typography>
            <Box container='true' alignContent='center' justifyContent={'center'} width={'75%'} marginBottom={'5%'}>
            <TextField inputProps={{style: {color: "white"}}} className='inputFields' color='secondary' label="Email" variant="filled" focused onChange={e => {handleEmailChange(e);}}/>
            </Box>
            <Box container='true' alignContent='center' justifyContent={'center'} width={'75%'} marginBottom={'5%'}>
            <TextField inputProps={{style: {color: "white"}}} className='inputFields' id="passwordInput" color='secondary' label="Password" variant="filled" type="password" focused onChange={e => {props.setPassword(e.target.value)}}/>
            </Box>
        <FormControlLabel sx={{color: '#ffffff'}} control={<Checkbox checked={DualFactor} onChange={handleDualFactorClick} color="error"  sx={{color: '#ffffff'}} />} label="Enable Dual Factor Authentication on log in?"/>
        {
            Boolean(error) ? 
            <Alert severity="error">{error}</Alert>
            : 
            <></>
        }
        {(allowSubmit ? 
                    <CustomSubmitButton className="submitButton" color="secondary" onClick={e => {e.preventDefault(); FormSubmit()}}>Sign Up</CustomSubmitButton>
                    :
                    <Typography fontSize={'5vh'} color='red'>Sign Up</Typography>
                    )}
        <Link variant="subtitle" component="button" color='secondary' onClick={() => navigate(`/login`)}>
            Log in
        </Link>
        </CustomTextContainer>
        </Grid>
        </ThemeProvider>
        
    )
}

export default SignUp