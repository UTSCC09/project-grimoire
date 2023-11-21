import {React, useState, useEffect} from "react"
import {Alert, Box, Button, Checkbox, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Slider, TextField, ThemeProvider, Typography, createTheme} from "@mui/material"
import {GoogleMap, Marker, useJsApiLoader} from "@react-google-maps/api"
import "./createGame.css"
import GrimoireCreateGroup from '../media/CreateGroupPicture.png'
import { getGames, postGroup } from "../api.mjs"
import { useNavigate } from "react-router";
import styled from "@emotion/styled"
import { Form } from "react-router-dom"

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
    const [isInPersonGame, setisInPersonGame] = useState(true)
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


    return (<Grid className="form" container justifyContent={'flex-start'} flexDirection={'column'} alignItems={'center'} height={'50%'} margin={'auto'} marginTop={'10vh'} width={'40%'}>
        <TextForm isInPersonGame={isInPersonGame} setisInPersonGame={setisInPersonGame} latitude={latitude} longtitude={longtitude} setLongtitude = {setLongtitude} setLatitude={setLatitude}/>
        <Grid width= '80%' height='50vh' container alignItems={'center'}>
        {(APILoaded.isLoaded && isInPersonGame) ?  <GoogleMap mapContainerStyle={{width: '100%', height: '100%',}} zoom={zoom} center = {{lat: latitude, lng: longtitude}}>
        </GoogleMap>
         : <Typography>Loading</Typography> }  
         </Grid> 
    </Grid>)
}

function TextForm(props)
{
    //All fields which are user generated
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
        if (props.latitude === 0 && props.longtitude === 0 && props.isInPersonGame)
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

    const handleSliderChange = function (setState)
    {
        return (
            (event, newValue) =>
            {
                setState(newValue)
            }
        )
    }
    //Yeah, I know this is a crappy way to make the code modular, but shut up
    const PreferenceArray= ['Combat', 'Puzzles', 'Social', 'Player Driven', 'Roleplaying', 'Homebrew']
    
    const PreferenceStateChangeArray = [handleSliderChange(setCombat), handleSliderChange(setPuzzles), handleSliderChange(setSocial),
        handleSliderChange(setPlayerDriven), handleSliderChange(setRoleplaying), handleSliderChange(setHomebrew)]

    return (
    <Grid container justifyContent={'center'} alignItems={'center'} width={'100%'}>
        <Typography fontSize={'2rem'} color={"white"}>Make a Group</Typography>
        <TextField className="inputField" color="textprimary" inputProps={{style: {color: "white"}}} variant="filled" focused label='Group Name' onChange={(e) => {e.preventDefault(); setgroupName((e.target.value));}}/>
        <SystemPick setgameName={setgameName} setError={setError}/>
        <Typography fontSize={'2rem'} color={"white"}>Indicate your preference for the following: (Optional)</Typography>
        <Preferences PreferenceStateChangeArray={PreferenceStateChangeArray} PreferenceArray={PreferenceArray}/>
        <LocationServices setRemote={props.setisInPersonGame}/>
        {props.isInPersonGame ?
            <Button color='textprimary' onClick={(e) => {e.preventDefault(); updateGoogleMapsLocation(props.setLatitude, props.setLongtitude, setError)}}>Get Location</Button>
            :
            <Typography sx={{color: '#ff0000'}}>Get Location</Typography>
        }
        <Button onClick={(e) => {e.preventDefault(); handleSubmission();}} color='textprimary'>Submit</Button>
        {
            (error) ? 
            <Alert severity="error">{error}</Alert> :
            <></>
        }
    </Grid>
    )
}


function LocationServices(props)
{
    const handleCheckBox = function (event)
    {
        props.setRemote(event.target.checked)
    }

    return (
        <FormControl sx={{width: '100%', color: '#ffffff', alignItems: 'center'}}> Will games be in person?
            <FormControlLabel labelPlacement="start" sx ={{width: '3%', color: '#ffffff'}}
            control = {<Checkbox  sx ={{color: '#ffffff', '&.Mui-checked': {color: '#ffffff'}}} defaultChecked onChange={handleCheckBox}/>}
            />
        </FormControl>
    )
}

function Preferences(props)
{
    
    return (
        <FormControl sx={{width: '90%', alignSelf: 'center', color: '#ffffff'}}>
            {   
                props.PreferenceArray.map(function (preference, index)
                {
                    return <FormControlLabel
                    control={<Slider
                        valueLabelDisplay="auto"
                        defaultValue={1}
                        step={1}
                        marks
                        min={1}
                        max={5}
                        sx={{color: '#ffffff', width: '80%'}}/>}
                        color="#ffffff"
                        label={preference}
                        onChange={props.PreferenceStateChangeArray[index]}
                        labelPlacement="top"
                        key={`Preference${preference}`}
                    />
                })
            }
        </FormControl>
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

function SystemPick(props)
{
    const [gameNames, setGameNames] = useState([]);

    useEffect(function ()
    {
        const controller = new AbortController();
        getGameNames(setGameNames, props.setError, controller)
    }, [])
    
    //RadioGroup helper provided by MaterialUI
    return (<FormControl>
        <FormLabel sx={{color: "#ffffff", '&.Mui-focused': { color: "#ffffff"}}} id="demo-row-radio-buttons-group-label">Pick a Supported Game</FormLabel>
        <RadioGroup
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
          sx={{color: '#ffffff'}}
        >
        {
            gameNames.map(function(gameSystem) 
            {
                return <FormControlLabel key={`RadioButton${gameSystem.name}`} value={`${gameSystem.name}`} 
                control={<Radio sx={{color: '#ffffff', '&.Mui-checked': {color: '#ffffff'}}} onChange={(event) => {event.preventDefault(); props.setgameName(`${gameSystem.name}`)}} />} label={`${gameSystem.name}`} />
            })
        }
        </RadioGroup>
      </FormControl>)
}

//Returns all supported gameNames as an array of strings
function getGameNames(setGameNames, setError, controller)
{
    getGames({page: 0, limit: 10}, controller.signal).then(async function (res) {
        if (!res.ok)
        {
            setError("Error in getting supported systems from the server. Please try again later")
            return;
        }
        else
        {
            const json = await res.json()
            setGameNames(json.records)
        }
    })
}


export default CreateGame