import {React, useState, useEffect} from "react"
import { useNavigate } from "react-router";
import {Button, Typography, Grid, ImageList, ImageListItem, Autocomplete, TextField} from "@mui/material"
import { getGames } from "../api.mjs";
import GameCard from "./GameCard";
import ErrorAlert from "../globalComponents/ErrorAlert";

function CreateCharacter(props){
    const navigate = useNavigate()
    const [games, setGames] = useState([])
    const [searchObj, setSearchObj]  = useState({})
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    function fetchGames(searchObj={}, signal=undefined){
        console.log('fetching')
        getGames(searchObj, signal).then(async (resp) => {
            if(!resp.ok){
                setError("Failed to reach our server, please reload and try again")
                return
            }
            const json = await resp.json()
            setGames(json.records)
        }).catch(e => {
            if(e.name !== 'AbortError'){
                console.error('error', e)
                setError("We encountered an error when trying to reach our server, please try again.")
            }
        })
    }

    function editSearchObj(key, value){
        const newObj = {...searchObj}
        if(value === undefined || value === null){
            delete newObj[key]
        }else{
            newObj[key] = value
        }
        setSearchObj(newObj)
        console.log('searchObj', newObj)
    }

    useEffect(()=>{
        const controller = new AbortController()
        fetchGames(searchObj, controller.signal)
        return () => {
            controller.abort()
        }
    }, [searchObj])

    function navigateToGame(gameName){
        gameName = gameName.replace(/\s+/g, ''); //removing spaces
        navigate(`./${gameName}/characterMancer`)
    }

    return (
        <Grid item container xs={12} sx={{justifyContent:'center', alignItems:'center', padding:"0.5%"}}>
            <Grid item container xs={12} spacing={2}>
                <Grid item container xs={6}>
                <Autocomplete
                fullWidth
                id="tags-standard"
                options={games}
                onInputChange={(e, newValue) => {e.preventDefault(); editSearchObj('name', newValue ? newValue : undefined)}}
                onChange={(e, chosenGame) => {e.preventDefault(); editSearchObj('name', chosenGame ? chosenGame.name : undefined)}}
                getOptionLabel={(game) => game.name}
                renderInput={(params) => (
                <TextField
                    {...params}
                    variant="standard"
                    label="Game"
                    placeholder="Game"
                />
                    )}
                />
                </Grid>
                <Grid item container xs={6}>
                    <Typography variant="h4">
                        Please pick your Game
                    </Typography>
                </Grid>
            </Grid>
            <Grid item container xs={12} sx={{paddingLeft: "5%", paddingRight:"5%"}}>
                {games.map((g) => (
                    <Grid item container xs={Math.max(4, 12 / (games.length || 1))} padding="0.5%">
                        <GameCard name={g.name} description={g.description} sx={{width:'100%'}}
                        gameId={g._id}
                        onClick={(e)=> {e.preventDefault(); navigateToGame(g.name)}}/>
                    </Grid>
                ))}
            </Grid>
            <ErrorAlert error={error} onClose={(e) => {e.preventDefault(); setError("")}}/>
        </Grid>
    )
}

export default CreateCharacter