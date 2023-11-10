import {React, useState} from "react"
import {Button, TextField, Alert} from "@mui/material"
import {useNavigate} from "react-router-dom"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { signUp } from "../api.mjs";

function SignUp(props){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    return <SignUpForm setEmail = {setEmail} setPassword = {setPassword} email = {email} password = {password}/>
}

function SignUpForm(props)
{
    const navigate = useNavigate();
    const [error, setError] = useState(null);
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
                console.log("Error: " + error);
            });
        }
    }
    
    return (
        <Grid2>
    <TextField id="emailInput" label="Email" variant="standard" onChange={e => {e.preventDefault(); props.setEmail(e.target.value)}}/>
    <TextField id="passwordInput" label="Password" variant="standard" onChange={e => {e.preventDefault(); props.setPassword(e.target.value)}}/>
    <Button onClick={e => {e.preventDefault(); FormSubmit()}}>Sign Up</Button>
    {
        Boolean(error) ? 
        <Alert severity="error">{error}</Alert>
        : 
        <></>
    }
        </Grid2>
        
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