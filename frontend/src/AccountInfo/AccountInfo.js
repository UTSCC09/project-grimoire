import { Box, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import "../styling/general.css"
import { isObjectEmpty } from "../helperFunctions/helper.mjs";
import { useLocation, useNavigate } from "react-router";
import { getUser } from "../api.mjs";

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
                setError(resp.body)
                return retFunc
            }
            setCurrUser(resp)
            console.log('currUser', isObjectEmpty(resp), resp)
        }).catch(e => {
            if(e.name !== 'AbortError'){
                console.error('error', e)
                setError("We encountered an error when trying to reach our server, please try again.")
            }
        })
        return retFunc
    }, [])

    return(
        <Box className="full-center">
            {
                isObjectEmpty(currUser) ? <></>
                :
                <Typography>Hi</Typography>
            }
        </Box>
    )
}

export default AccountInfo