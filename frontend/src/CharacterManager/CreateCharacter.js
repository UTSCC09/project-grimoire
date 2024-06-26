import {React, useState, useEffect} from "react"
import { useNavigate } from "react-router";
import {Button, Typography, Grid, ImageList, ImageListItem, Autocomplete, TextField, Pagination, Box} from "@mui/material"
import { getGames } from "../api.mjs";
import GameCard from "./GameCard";
import ErrorAlert from "../globalComponents/ErrorAlert";

function CreateCharacter(props){
    const navigate = useNavigate()
    const [games, setGames] = useState([])
    const [numGames, setNumGames] = useState(0)
    const [searchObj, setSearchObj]  = useState({page: 0, limit:10})
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    function fetchGames(searchObj={}, signal=undefined){
        getGames(searchObj, signal).then(async (resp) => {
            if(!resp.ok){
                setError("Failed to reach our server, please reload and try again")
                return
            }
            const json = await resp.json()
            setGames(json.records)
            setNumGames(json.numGames)
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
    }

    useEffect(()=>{
        const controller = new AbortController()
        fetchGames(searchObj, controller.signal)
        return () => {
            controller.abort()
        }
    }, [searchObj])

    function navigateToGame(game){
        if(!game.deployed){
            setError(`${game.name} is still in development, please try a different game`)
            return
        }
        const gameName = game.name.replace(/\s+/g, ''); //removing spaces
        navigate(`./${gameName}`)
    }

    return (
        <Grid item container xs={12} className="page-container-cover" spacing={.5}>
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
                    focused
                    {...params}
                    variant="standard"
                    label="Game"
                    placeholder="Game"
                />
                    )}
                />
                </Grid>
                <Grid item container xs={6}>
                    <Typography variant="h4" color="secondary">
                        Please pick your Game
                    </Typography>
                </Grid>
            </Grid>
            <Grid item container xs={12} spacing={2}>
                {games.map((g) => (
                    <Grid item container xs={Math.max(4, 12 / (games.length || 1))}>
                        <GameCard {...g}  sx={{width:'100%', paddingBottom:"0.5%"}}
                        onClick={(e)=> {e.preventDefault(); navigateToGame(g)}}/>
                    </Grid>
                ))}
                {games.map}
            </Grid>
            <Grid item container xs={12} sx={{justifyContent:'center', alignItems:'center'}}>
                <Pagination count={Math.ceil(numGames / 10)} page={searchObj.page + 1} //have to offset because mui starts at index 1
                color="secondary"
                onChange={(e,value) => {e.preventDefault(); editSearchObj('page', value - 1)}}/>
            </Grid>
            <ErrorAlert error={error} onClose={(e) => {e.preventDefault(); setError("")}}/>
        </Grid>
    )
}

export default CreateCharacter