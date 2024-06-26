import {React, useState, useEffect} from "react"
import {Button, Alert, TextField, createTheme, Grid, ThemeProvider, Typography, Box} from "@mui/material"
import { getCurrentUser, logIn } from "../api.mjs";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {useNavigate, useLocation, Link} from "react-router-dom"
import {setusername} from "../Template/NavBar.js"
import { red } from "@mui/material/colors";
import styled from "@emotion/styled";
import GrimoireSignUpImage from "../media/GrimoireSignUpImage.png"
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
    width: '30%',
    height: '105vh',
    backgroundColor: theme.palette.primary.main,
    flex: theme.sizing.display.primary
}))

const CustomSubmitButton = styled(Button)(({theme}) => ({
    fontSize: '200%'
}))

function Login(props){

    let location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    return <LogInForm password = {password} email = {email} setEmail = {setEmail} setPassword = {setPassword} location = {location}/>
}

function LogInForm(props)
{
    const [error, setError] = useState(null);
    const [allowSubmit, setallowSubmit] = useState(false)
    const navigate = useNavigate();
    
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

    const FormSubmit = function () {
        if (props.email === '' || props.password === '')
            {
                setError("Please fill in both fields.")
            }
        else 
        {
            logIn(props.email, props.password).then(async function (response) 
            {
                if (!response.ok)
                {
                    if (response.status === 400)
                        throw new Error("Input is invalid.")
                    else if (response.status === 500)
                        throw new Error("Server error, please try again");
                    else
                        throw new Error("Invalid username or incorrect password");
                }
                else
                {
                    const json = await response.json();
                    if (json.dfa)
                        navigate("/DualFactorAuth");
                    else
                        navigate(props.location.state && props.location.state.path ? props.location.state.path : "/");
                }
            })
            .catch(function (error)
            {
                console.log("Connection could not be made to the server.");
                setError(String(error))
            });
        }
    }
    //How can I make errors nice without having them constantly present? Ask God.

    return (
        <ThemeProvider theme={theme}>
    <Grid sx={{backgroundColor: '#000000', height: '103vh'}} spacing={0} container item flexDirection={"row"}  xs={12}>
    <div className="imgcontainer">
            <img alt="SignUpPicture" style={{maxHeight: '100%', maxWidth: '100%', display: 'fill'}} src={GrimoireSignUpImage}/>
        </div>
        <CustomTextContainer spacing={10} item container direction="column" justifyContent={"flex-start"} alignItems={"center"}>
            <Typography marginTop={'30%'} marginBottom={'5%'} color='secondary' fontSize={'400%'} className="signUpPrompt">Welcome Back</Typography>
            <Box container='true' alignContent='center' justifyContent={'center'} width={'75%'} marginBottom={'5%'}>
            <TextField inputProps={{style: {color: "white"}}} className='inputFields' color='secondary' label="Email" variant="filled" focused onChange={e => {handleEmailChange(e);}}/>
            </Box>
            <Box container='true' alignContent='center' justifyContent={'center'} width={'75%'} marginBottom={'5%'}>
            <TextField inputProps={{style: {color: "white"}}} className='inputFields' id="passwordInput" color='secondary' label="Password" variant="filled" type="password" focused onChange={e => {props.setPassword(e.target.value)}}/>
            </Box>
        {(allowSubmit ? 
                    <CustomSubmitButton className="submitButton" color="secondary" onClick={e => {e.preventDefault(); FormSubmit()}}>Log In</CustomSubmitButton>
                    :
                    <Typography fontSize={'5vh'} color='red'>Log In</Typography>
                    )}
            <Link variant="subtitle" component="button" onClick={(e) => {e.preventDefault(); navigate('/signup')}}>
                Sign Up
            </Link>
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
  

export default Login