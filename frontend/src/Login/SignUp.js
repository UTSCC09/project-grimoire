import {React, useState, useEffect} from "react"
import {Button, TextField, Alert} from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { signUp } from "../api.mjs";

function SignUp(props){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    return <SignUpForm setUsername = {setEmail} setPassword = {setPassword} email = {email} password = {password}/>
}

function SignUpForm(props)
{
    const FormSubmit = function (event) {
        event.preventDefault();
        signUp(props.email, props.password)
    }
    //How can I make errors nice without having them constantly present? Ask God.

    return (
        <Grid2>
    <TextField id="emailInput" label="Email" variant="standard" onChange={e => {e.preventDefault(); props.setEmail(e.target)}}/>
    <TextField id="passwordInput" label="Password" variant="standard" onChange={e => {e.preventDefault(); props.setPassword(e.target)}}/>
    <Button onClick={FormSubmit}>Sign Up</Button>
    <Alert severity="error">Please fill in both fields.</Alert>
    <Alert severity="error">Need to enter a valid email address</Alert>
    <Alert severity="error">This is an error alert — check it out!</Alert>
        </Grid2>
        
    )
}

export default SignUp