import {React, useState, useEffect} from "react"
import {Button, Alert, TextField} from "@mui/material"
import { getCurrentUser, logIn } from "../api.mjs";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {useNavigate, useLocation} from "react-router-dom"
import {setusername} from "../Template/NavBar.js"

function Login(props){

    let location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    return <LogInForm password = {password} email = {email} setEmail = {setEmail} setPassword = {setPassword} location = {location}/>
}

function LogInForm(props)
{
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const FormSubmit = function () {
        if (props.email === '' || props.password === '')
            {
                setError("Please fill in both fields.")
            }
        else 
        {
            logIn(props.email, props.password).then(function (response) 
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
                    localStorage.setItem("username", getCurrentUser());
                    navigate("/");
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
        <Grid2>
    <TextField label="Email" variant="standard" onChange={(e) => {e.preventDefault(); props.setEmail(e.target.value)}}/>
    <TextField label="Password" variant="standard" onChange={(e) => {e.preventDefault(); props.setPassword(e.target.value)}}/>
    <Button onClick={(e) => {e.preventDefault(); FormSubmit()}}>Log In</Button>
    {
        Boolean(error) ? 
        <Alert severity="error">{error}</Alert>
        : 
        <></>
    }
        </Grid2>
        
    )
}

export default Login