import { Box, Button, Card, CardActionArea, CardContent, CircularProgress, Grid, IconButton, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getDISEquipment } from "../../api.mjs";
import ErrorAlert from "../../globalComponents/ErrorAlert";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import "../characterCreation.css"

function EquipmentCard(props){
    function getContainsString(){
        return (<>
        <Typography>Contains the following:</Typography>
        {props.items && props.items.length ?
            <Typography>{"Items: " + props.items.map((i) => i.name).join(', ')}</Typography> : <></>}
        {props.weapons && props.weapons.length ?
            <Typography>{"Weapons: " + props.weapons.map((i) => i.weapons.name).join(', ')}</Typography> : <></>}
        {props.armor && props.armor.length ?
            <Typography>{"Armor: " + props.armor.map((i) => i.base.name).join(', ')}</Typography> : <></>}
        </>)
    }

    function chooseEquip(){
        props.onUpdate({
            startingEquip: {
                weapons: props.weapons,
                items: props.items,
                armor: props.armor
            }
        },
        true,
        true
        )
    }

    return (
        <Card sx={{width:'100%'}}>
            <Grid item container xs={12}>
            <Grid container item xs={10} sx={{flexDirection:'row', display:'flex'}}>
                <CardContent>
                    <Grid item container xs={12}>
                        <Grid item xs={12}>
                            <Typography gutterBottom variant="h5" component="div">
                                {props.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {getContainsString()}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Grid>
            <Grid item container xs={2} backgroundColor="#bfb2ae">
                <CardActionArea onClick={chooseEquip}>
                        <ArrowForwardIosIcon/>
                </CardActionArea>
            </Grid>
            </Grid>
        </Card>
    )
}

function DISEquipment(props){
    const [equipment, setEquipment] = useState([])
    const [error, setError] = useState("")
    const [searchObj, setSearchObj] = useState({page: 0})
    const [loading, setLoading] = useState(false)
    const [nextExists, setNextExists] = useState(false)

    function loadMore(){
        const newSearch = {...searchObj}
        newSearch.page += 1
        setSearchObj(newSearch)
    }

    useEffect(() => {
        const abortCont = new AbortController()
        setLoading(true)
        getDISEquipment(searchObj, abortCont.signal)
        .then(async (resp) => {
            const json = await resp.json()
            if(!resp.ok){
                setError(json.body)
                return
            }
            setEquipment([...equipment, ...json.records])
            setLoading(false)
            setNextExists(json.nextPageExists)
        }).catch(e =>{
            if(e.name !== 'AbortError'){
                console.error(e)
                setError("an unexpected Error occured please refresh the page and try again")
                setLoading(false)
            }
        })
        return () => abortCont.abort()
    }, [searchObj])

    function updateSearchObj(key, value){
        const newSearch = {...searchObj}
        if(!Boolean(value) && typeof value !=='number')
            delete newSearch[key]
        else
            newSearch[key] = value
        setSearchObj(newSearch)
    }

    return(
        <Grid item container xs={12}>
            <Grid item container xs={12} sx={{width:"100%"}} spacing={1}>
                <TextField label="equipment package" value={searchObj.name || ""} 
                onChange={(e) => {e.preventDefault(); updateSearchObj('name', e.target.value)}}/>
                {equipment.map((o) => (
                    <Grid item container xs={12}>
                        <EquipmentCard {...o} onUpdate={props.onUpdate}/>
                    </Grid>
                ))}
                <Grid item container xs={12} className="center">
                    {loading ? <CircularProgress/> : <></>}
                </Grid>
                <Grid item container xs={12} className="center">
                    {nextExists ? <Button onClick={loadMore}>Load more</Button> : <></>}
                </Grid>
            </Grid>
            <ErrorAlert open={Boolean(error)} onClose={(e) => setError("")} error={error}/>
        </Grid>
    )
}

export default DISEquipment