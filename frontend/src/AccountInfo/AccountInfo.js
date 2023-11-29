import { Box, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { isObjectEmpty } from "../helperFunctions/helper.mjs";
import { useLocation, useNavigate } from "react-router";
import { getUser } from "../api.mjs";

import "../styling/general.css"
import "./info.css"

function AccountInfo(props){
    const navigate = useNavigate()
    const location = useLocation()

    const [currUser, setCurrUser] = useState({})
    const [error, setError] = useState("")

    useEffect(()=>{
        const abortCont = new AbortController()
        const retFunc = () => abortCont.abort
        getUser(abortCont.signal).then(async (resp) => {
            const json = await resp.json()
            if(!resp.ok){
                //if was because not logged in
                if(resp.status === 401){
                    navigate("/login", {state: {path: location.pathname}})
                }
                setError(json.body)
                return retFunc
            }
            setCurrUser(json)
        }).catch(e => {
            if(e.name !== 'AbortError'){
                console.error('error', e)
                setError("We encountered an error when trying to reach our server, please try again.")
            }
        })
        return retFunc
    }, [])

    return(
        <Box item container xs={12} className="full" justifyContent='center'>
            {
                isObjectEmpty(currUser) ? <></>
                :
                <Box item container xs={12} width="100%">
                    <Grid item xs={12}>
                        <Typography align='center' variant="h3">Welcome!</Typography>
                    </Grid>
                </Box>
            }
        </Box>
    )
}

export default AccountInfo