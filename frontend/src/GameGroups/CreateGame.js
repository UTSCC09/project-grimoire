import {React, useState, useEffect} from "react"
import {Alert, Box, Button, Grid, TextField, ThemeProvider, Typography, createTheme} from "@mui/material"
import {GoogleMap, Marker, useJsApiLoader} from "@react-google-maps/api"
import "./createGame.css"
import GrimoireCreateGroup from '../media/CreateGroupPicture.png'
import { postGroup } from "../api.mjs"
import { useNavigate } from "react-router";

const theme = createTheme({
    palette:
    {
        primary:
        {
            main: '#000000'
        },
        secondary:
        {
            main: '#36393f'
        },
        textprimary:
        {
            main:"#ffffff"
        }
        
    },
    Box:
    {
        palette:
        {
            primary:
            {
                main: 'primary'
            },
            secondary:
            {
                main: 'secondary'
            }
            
        }
    }
})



function CreateGame(props){

    

      return (
        <ThemeProvider theme={theme}>
      <Box container='true' spacing={0} justifyContent={'center'} alignItems={'center'} className='entireScreen'>
        <Box className='imageContainer'>
      <img alt='SignUpImage' className='signUpImage' src={GrimoireCreateGroup}/>
        </Box>
        <CreateGameForm/>
      </Box>
      </ThemeProvider>
      )
        
}

function CreateGameForm(props)
{
    
    const [latitude, setLatitude] = useState(0)
    const [longtitude, setLongtitude] = useState(0)
    const [error, setError] = useState(null);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        if (latitude === 0 && longtitude === 0)
        {
            setZoom(1);
        }
        else 
        {
            setZoom(17);
        }
        console.log('Map center changed:' + String(latitude) + " " + String(longtitude));
      }, [latitude, longtitude]);

    const APILoaded = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: ['places']
    })


    return (<Grid className="form" container justifyContent={'flex-start'} alignItems={'flex-start'} flexDirection={'column'} height={'50%'} margin={'auto'} marginTop={'10vh'} width={'40%'}>
        <TextForm latitude={latitude} longtitude={longtitude} setLongtitude = {setLongtitude} setLatitude={setLatitude}/>
        {(APILoaded.isLoaded) ?  <GoogleMap mapContainerStyle={{width: '75%', height: '100%',}} zoom={zoom} center = {{lat: latitude, lng: longtitude}}>
        </GoogleMap>
         : <Typography>Loading</Typography> }   
    </Grid>)
}

function TextForm(props)
{
    const [error, setError] = useState(null)
    const [groupName, setgroupName] = useState(null);
    const [gameName, setgameName] = useState(null);
    const [combat, setCombat] = useState(null);
    const [puzzles, setPuzzles] = useState(null);
    const [social, setSocial] = useState(null);
    const [playerDriven, setPlayerDriven] = useState(null);
    const [roleplaying, setRoleplaying] = useState(null);
    const [homebrew, setHomebrew] = useState(null);

    const navigate = useNavigate();
    
    const handleSubmission = function () {
        if (props.latitude === 0 && props.longtitude === 0)
        {
            setError("Location needs to be set")
        }
        else if (!groupName)
        {
            setError("Group name is empty")
        }
        else if (!gameName)
        {
            setError("Game has not been set");
        }
        else 
        {
            postGroup(props.latitude, props.longtitude, groupName, gameName,
                    combat, puzzles, social, playerDriven, roleplaying, homebrew).then(function (resp)
            {
                if (!resp.ok)
                {
                    setError("Connection to server could not be established, please check your inputs")
                }
                else 
                {
                    navigate("/LookingForGame")
                }
            })
            .catch(function(error)
            {
                setError(String(error))
            })
        }
    } 

    return (
    <Grid width={'60%'}>
        <Typography color={"white"}>Make a Group</Typography>
        <TextField className="inputField" color="textprimary" inputProps={{style: {color: "white"}}} variant="filled" focused label='Group Name' onChange={(e) => {e.preventDefault(); setgroupName((e.target.value));}}/>
        <TextField className="inputField" color='textprimary' inputProps={{style: {color: "white"}}} variant="filled" focused label='Game' onChange={(e) => {e.preventDefault(); setgameName((e.target.value));}}/>
        <TextField className="inputField" color='textprimary' inputProps={{style: {color: "white"}}} variant="filled" focused label="Combat" onChange={(e) => {e.preventDefault(); setCombat(parseInt(e.target.value));}}></TextField>
        <TextField className="inputField" color='textprimary' inputProps={{style: {color: "white"}}} variant="filled" focused label = "Puzzles" onChange={(e) => {e.preventDefault(); setPuzzles(parseInt(e.target.value));}}></TextField>
        <TextField className="inputField" color='textprimary' inputProps={{style: {color: "white"}}} variant="filled" focused label = "Social" onChange={(e) => {e.preventDefault(); setSocial(parseInt(e.target.value));}}></TextField>
        <TextField className="inputField" color='textprimary' inputProps={{style: {color: "white"}}} variant="filled" focused label = "Player Driven" onChange={(e) => {e.preventDefault(); setPlayerDriven(parseInt(e.target.value));}}></TextField>
        <TextField className="inputField" color='textprimary' inputProps={{style: {color: "white"}}} variant="filled" focused label = "Roleplaying" onChange={(e) => {e.preventDefault(); setRoleplaying(parseInt(e.target.value));}}></TextField>
        <TextField className="inputField" color='textprimary' inputProps={{style: {color: "white"}}} variant="filled" focused label = "Homebrew" onChange={(e) => {e.preventDefault(); setHomebrew(parseInt(e.target.value));}}></TextField> 
        <Button color='textprimary' onClick={(e) => {e.preventDefault(); updateGoogleMapsLocation(props.setLatitude, props.setLongtitude, setError)}}>Get Location</Button>
        <Button onClick={(e) => {e.preventDefault(); handleSubmission();}} color='textprimary'>Submit</Button>
        {
            (error) ? 
            <Alert severity="error">{error}</Alert> :
            <></>
        }
    </Grid>
    )
}

function updateGoogleMapsLocation(setLatitude, setLongtitude, setError)
{
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(function (position) {
            setLatitude(parseFloat(position.coords.latitude));
            setLongtitude(parseFloat(position.coords.longitude)); 
        }, function(error) 
        {
            setError(error)
        });
    }
    else
    {
        setError("Browser does not support geolocation, please manually input a meeting place");
    }
}


export default CreateGame