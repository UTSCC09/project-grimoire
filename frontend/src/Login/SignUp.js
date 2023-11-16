import {React, useState} from "react"
import {Button, TextField, Alert, Grid, ThemeProvider, createTheme} from "@mui/material"
import {useNavigate} from "react-router-dom"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { signUp, getSessionCode } from "../api.mjs";
import GrimoireSignUpImage from "../media/GrimoireSignUpImage.png"
import "../styling/signUp.css";
import styled from "@emotion/styled";
import { red } from "@mui/material/colors"; 


const theme = createTheme({
    palette: 
    {
        primary:
        {
            main: '#000000'
        }
    },
    sizing:
    {
        width:
        {
            primary: 'auto'
        }
       
    }
})

const CustomTextContainer = styled(Grid)(({theme}) =>({
    backgroundColor: theme.palette.primary.main,
    width: theme.sizing.width.primary
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
            signUp(props.email, props.password).then(function (response) 
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
    <Grid className="signUpPageCont" spacing={0} container item direction={"row"} xs={12}>
        <img alt="SignUpPicture" className="signUpImage" src={GrimoireSignUpImage}></img>
        <CustomTextContainer item container direction="column" xs={3} justifyContent={"center"} alignItems={"center"}>
            <TextField id="emailInput" label="Email" variant="standard" onChange={e => {e.preventDefault(); props.setEmail(e.target.value)}}/>
            <TextField id="passwordInput" label="Password" variant="standard" onChange={e => {e.preventDefault(); props.setPassword(e.target.value)}}/>
            <Button onClick={e => {e.preventDefault(); FormSubmit()}}>Sign Up</Button>
        {
            Boolean(error) ? 
            <Alert severity="error">{error}</Alert>
            : 
            <></>
        }
        </CustomTextContainer>
        </Grid>
        </ThemeProvider>
        
    )
}

const OFFICIALEMAILREGEX =  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/

function isValidEmail(email){    
    try{
        return String(email)
        .toLowerCase()
        .match(OFFICIALEMAILREGEX);
    }catch(e){
        return false
    } 
}

export default SignUp