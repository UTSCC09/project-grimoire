import { Avatar, Box, Button, Checkbox, Divider, FormControlLabel, FormGroup, Grid, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { isObjectEmpty, isValidEmail } from "../helperFunctions/helper.mjs";
import { useLocation, useNavigate } from "react-router";
import { URL, UploadProfilePic, getUser } from "../api.mjs";
import AddIcon from '@mui/icons-material/Add';

import "../styling/general.css"
import "./info.css"
import GridBreak from "../globalComponents/GridBreak";

function AccountInfo(props){
    const navigate = useNavigate()
    const location = useLocation()

    const [currUser, setCurrUser] = useState({})
    const [userHover, setUserHover] = useState(false)
    const [error, setError] = useState("")

    const fetchUser = (signal=undefined) => {
        getUser(signal).then(async (resp) => {
            const json = await resp.json()
            if(!resp.ok){
                //if was because not logged in
                if(resp.status === 401){
                    navigate("/login", {state: {path: location.pathname}})
                }
                setError(json.body)
                return
            }
            setCurrUser(json)
        }).catch(e => {
            if(e.name !== 'AbortError'){
                console.error('error', e)
                setError("We encountered an error when trying to reach our server, please try again.")
            }
        })
    }

    useEffect(()=>{
        const abortCont = new AbortController()
        const retFunc = () => abortCont.abort()
        fetchUser(abortCont.signal, retFunc)
        return retFunc
    }, [])

    function changeField(key, value){
        let newUser = {...currUser}
        newUser[key] = value
        setCurrUser(newUser)
    }

    function getAvatar(){
        if(userHover){
            return(<Avatar><AddIcon/></Avatar>)
        }

        if(currUser.profilePicture && !isObjectEmpty(currUser.profilePicture)){
            return <Avatar alt="profile picture" src={`${URL}/api/users/${currUser._id}/pic`}/>
        }
        return <Avatar/>
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        UploadProfilePic(currUser._id, file).then((resp) =>{
            const json = resp.json()
            if(!resp.ok){
                setError(json.body)
                console.error('error', json.body)
                return
            }
        }).catch(e => {
            setError("An internal error occured, please reload the page and try again.")
        })
    };

    return(
        <Box className="full" justifyContent='center'>
            {
                isObjectEmpty(currUser) ? <></>
                :
                <Box width="100%" justifyContent='space-evenly'>
                    <Box className='center' width='100%' >
                        <Typography align='center' variant="h3">Welcome!</Typography>
                    </Box>
                    <Grid item container xs={12} width="100%" minHeight="50%" justifyContent="space-evenly">
                        <Grid item container xs={5} className="basic-panel" justifyContent="flex-start">
                            <Box className="center" width="100%">
                                <Grid item container xs={12}>
                                    {/* code modified from stackoverflow https://stackoverflow.com/a/63890882 */}
                                    <Grid item xs={2}>
                                    <input
                                        type="file"
                                        accept="image/*"  // Specify the file types allowed (e.g., images)
                                        style={{ display: 'none' }}
                                        id="upload-input"
                                        onChange={handleFileUpload}
                                    />
                                        <label htmlFor="upload-input">
                                            <Button component="span"
                                            onMouseEnter={() => setUserHover(true)}
                                            onMouseLeave={() => setUserHover(false)}>
                                                {getAvatar()}
                                            </Button>
                                        </label>
                                    </Grid>
                                    <Grid item xs={10}>
                                        <Typography>Your Info</Typography>
                                    </Grid>
                                </Grid>
                                <Divider sx={{background:'red', margin:'0.5%', marginBottom:'1.5%'}}/>
                                <Grid item container xs={12} width="100%" spacing={1}>
                                    <Grid item xs={6}>
                                        <TextField label="Name" value={currUser.name || ""}
                                        fullWidth
                                        onChange={(e) => {e.preventDefault(); changeField('name', e.target.value)}}/>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField label="Email" required value={currUser.email}
                                        fullWidth
                                        error={!isValidEmail(currUser.email)}
                                        onChange={(e) => {e.preventDefault(); changeField('name', e.target.value)}}/>
                                    </Grid>
                                    <Grid item xs={6}>
                                    <FormGroup>
                                        <FormControlLabel label="Enable 2-Factor Authenticaiton" 
                                        control={<Checkbox onChange={(e) => changeField('twofa', e.target.checked)}
                                            value={currUser.twofa}/>}/>
                                    </FormGroup>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                        <Grid item container xs={5} className="basic-panel">
                            <Typography>Your groups</Typography>
                                {currUser.groups.map((g) => (
                                <Grid item xs={12}>
                                    <Typography>{g.name}</Typography>
                                </Grid>
                                ))}
                        </Grid>
                        <GridBreak/>
                        <Grid item xs={2}>
                            <Button fullWidth>Save</Button>
                        </Grid>
                        
                    </Grid>
                </Box>
            }
        </Box>
    )
}

export default AccountInfo