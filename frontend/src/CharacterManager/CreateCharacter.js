import {React, useState, useEffect} from "react"
import { useNavigate } from "react-router";
import {Button, Typography, Grid, ImageList, ImageListItem} from "@mui/material"
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

    useEffect(()=>{
        const controller = new AbortController()
        fetchGames(searchObj, controller.signal)
        return () => {
            controller.abort()
        }
    }, [])

    function navigateToGame(gameName){
        gameName = gameName.replace(/\s+/g, ''); //removing spaces
        navigate(`./${gameName}/characterMancer`)
    }

    return (
        <Grid item container xs={12} sx={{justifyContent:'center', alignItems:'center'}}>
            <Typography>
                Please pick your Game
            </Typography>
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