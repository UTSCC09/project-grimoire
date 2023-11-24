import { Box, Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Dialog, DialogActions, DialogContent,
     DialogTitle, Divider, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getDISOrigins } from "../../api.mjs";
import '../characterCreation.css'
import ErrorAlert from "../../globalComponents/ErrorAlert";

function OriginCard(props){
    const [expanded, setExpanded] = useState(false)
    const [selectedBonus, setselectedBonus] = useState(0)

    const onClose = (event) =>{
        if(event)
            event.preventDefault();
        setExpanded(false)
    }

    function updateMancer(){
        props.onUpdate({
            origin: props._id,
            chosenOrigin: props.name,
            chosenBenefit: props.benefits[selectedBonus],
            originBenefit: selectedBonus
        }, true, true)
        onClose()
    }

    return (
        <>
        <Card sx={{width:'100%'}}>
            {/* <CardMedia/> */}
            <CardActionArea>
                <CardContent onClick={() => {setExpanded(true)}}>
                    <Typography gutterBottom variant="h5" component="div">
                        {props.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {props.description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
        <Dialog onClose={onClose} open={expanded} maxWidth="sm" fullWidth>
            <DialogTitle>{props.name}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary">
                    {props.description}
                </Typography>
                <Grid item container xs={12}>
                    <Typography>Benefits</Typography>
                    <RadioGroup
                    value={selectedBonus}
                    onChange={(e) => {e.preventDefault(); setselectedBonus(Number(e.target.value))}}
                    >
                    {props.benefits.map((s, index) => (
                        <FormControlLabel value={index} control={<Radio />} sx={{width:'100%'}} 
                        label={<Box sx={{width:"100%"}}>
                            <Typography>{s.name}</Typography>
                            <Divider/>
                            <Typography>{s.description}</Typography>
                            </Box>
                        }/>
                    ))}
                </RadioGroup>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Go Back</Button>
                <Button onClick={updateMancer}>Choose This Origin</Button>
            </DialogActions>
        </Dialog>
        </>
    )
}

function DISOrigin(props){
    const [origins, setOrigins] = useState([])
    const [searchObj, setSearchObj] = useState({page: 0})
    const [nextExists, setNextExists] = useState(false)
    const [error, setError] = useState()
    const [loading, setLoading] = useState(false)

    function updateSearchObj(key, value){
        const newSearch = {...searchObj}
        if(!Boolean(value) && typeof value !=='number')
            delete newSearch[key]
        else
            newSearch[key] = value
        setSearchObj(newSearch)
    }

    function loadMore(){
        const newSearch = {...searchObj}
        newSearch.page += 1
        setSearchObj(newSearch)
    }

    useEffect(() => {
        const abortCont = new AbortController()
        setLoading(true)
        getDISOrigins(searchObj, abortCont.signal)
        .then(async (resp) => {
            const json = await resp.json()
            if(!resp.ok){
                console.error(json.body)
                setError(json.body)
                return
            }
            setOrigins([...origins, ...json.records])
            setNextExists(json.nextPageExists)
            setLoading(false)
        }).catch(e => {
            if(e.name !== 'AbortError'){
                console.error(e)
                setError("an unexpected Error occured please refresh the page and try again")
                setLoading(false)
            }
        })

        return () => abortCont.abort()
    }, [searchObj])

    return(
        <Grid item container xs={12}>
            <Grid item container xs={12} sx={{width:"100%"}} spacing={1}>
                <TextField label="origin name" value={searchObj.name || ""} 
                onChange={(e) => {e.preventDefault(); updateSearchObj('name', e.target.value)}}/>
                {origins.map((o) => (
                    <Grid item container xs={12}>
                        <OriginCard {...o} onUpdate={props.onUpdate}/>
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

export default DISOrigin