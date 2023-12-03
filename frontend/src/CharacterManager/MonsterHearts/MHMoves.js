import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types'
import { Card, Grid, Typography } from "@mui/material";
import { getMoves } from "../../api.mjs";

function MoveCard(props){
    return (
        <Card>
            <Typography gutterBottom variant="h5" component="div">
                {props.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {props.description}
            </Typography>
        </Card>
    )
}

function MHMoves(props){
    const [moves, setMoves] = useState([])
    const [searchParams, setSearchparams] = useState({page: 0, limit:10})
    const [error, setError] = useState("")

    useEffect(() => {
        const controller = new AbortController()
        getMoves(searchParams, controller.signal).then(async resp => {
            if(!resp.ok){
                console.log('resp not ok')
                return
            }
            const json = await resp.json()
            console.log('json', json)
            setMoves(json.records)
        }).catch(e => {
            console.error(e)
            if(e.name !== 'AbortError'){
                setError("Test")
            }
        })
    }, [])

    return (
    <Grid>
        <Typography>
            Choose your Moves
            <Grid item container xs={12} spacing={1} sx={{padding:"0.5%"}}>
                {moves.map((m) => (
                    <Grid item xs={12}>
                        <MoveCard {...m}/>
                    </Grid>
                ))}
            </Grid>
        </Typography>
    </Grid>)
}
export default MHMoves