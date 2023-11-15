import {React, useState, useEffect} from "react"
import {Box, Button, Grid, TextField, Typography} from "@mui/material"
import {GoogleMap, useJsApiLoader} from "@react-google-maps/api"

function CreateGame(props){
    const APILoaded = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: ['places']
    })

    const [gameName, setgameName] = useState(false)
    const [latitude, setLatitude] = useState(0)
    const [longtitude, setLongtitude] = useState(0)
    const [error, setError] = useState(null);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        console.log('Map center changed:' + String(latitude) + " " + String(longtitude));
      }, [latitude, longtitude]);
      return (<Box>
        {(APILoaded.isLoaded) ?  <GoogleMap mapContainerStyle={{width: '100%', height: '100%'}} zoom={10} center = {{lat:40, lng: 42}}>pp</GoogleMap>
         : <Typography>Loading</Typography> }
      </Box>)
    if (APILoaded.isLoaded)
    {
    return
        
    }
    else 
    {
        
    }
        
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