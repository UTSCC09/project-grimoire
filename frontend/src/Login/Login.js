import {React, useState, useEffect} from "react"
import {Button, Alert, TextField} from "@mui/material"
import { logIn } from "../api.mjs";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";

function Login(props){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    return <LogInForm password = {password} email = {email} setEmail = {setEmail} setPassword = {setPassword}/>
}

function LogInForm(props)
{
    const FormSubmit = function (event) {
        event.preventDefault();
        logIn(props.email, props.password).then()
    }
    //How can I make errors nice without having them constantly present? Ask God.

    return (
        <Grid2>
    <TextField label="Email" variant="standard" onChange={(e) => {e.preventDefault(); props.setEmail(e.target)}}/>
    <TextField label="Password" variant="standard" onChange={(e) => {e.preventDefault(); props.setPassword(e.target)}}/>
    <Button onClick={FormSubmit}>Log In</Button>
    <Alert severity="error">Please fill in both fields.</Alert>
    <Alert severity="error">Need to enter a valid email address</Alert>
    <Alert severity="error">This is an error alert — check it out!</Alert>
        </Grid2>
        
    )
}

export default Login