import {React, useState} from "react"
import {Button, Alert, Grid, Typography, TextField} from "@mui/material"
import { dualFactorValidate} from "../api.mjs";
import { useNavigate } from "react-router";

export function DualFactorAuth(props){

    const [validatecode, setvalidatecode] = useState("");
    const [error, seterror] = useState(null);
    const navigate = useNavigate();
    
    const handleSubmit = function() {
        dualFactorValidate(validatecode)
        .then(function (response) {
            if (!response.ok)
            {
                if(response.status === 400)
                {
                    throw new Error("No input was detected. Please insert validation code.")
                }
                if (response.status === 403)
                    throw new Error("Incorrect validation code");
            }
            else
                navigate("/");
        })
        .catch(error)
        {
            seterror(error);
        }
    }

    return <Grid>
        <Typography>A verification code was sent to your email with your entry code, please enter it.</Typography>
        <TextField onChange={function (event) {event.preventDefault(); setvalidatecode(event.target.value)}}></TextField>
        <Button onClick={function (event) {event.preventDefault(); handleSubmit();}}></Button>
        {
            Boolean(error) ?
                <Alert severity="error">{error}</Alert> :
                <></>
        }
    </Grid>
}

export default DualFactorAuth;

