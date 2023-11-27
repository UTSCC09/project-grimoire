import {React, useState, useEffect} from "react"
import {Button, Grid, Typography, Alert, CircularProgress} from "@mui/material"
import { getCharacterSheets, getPictureOfSheet } from "../api.mjs"
import "./characterSheetHomePage.css"
import {useNavigate} from "react-router-dom"

function CharacterSheetHomePage(props){

    return <Grid spacing={1} height={'100vh'} container alignItems={'flex-start'} justifyContent={'center'}>
        <CharacterSheetList/>
    </Grid> 
}

function CharacterSheetList(props)
{
    const [error, setError] = useState(null)
    const [sheets, setSheets] = useState(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [rightPageBtn, setRightPageBtn] = useState(false)
    const [leftPageBtn, setLeftPageBtn] = useState(false)

    useEffect(function () 
    {
        setLoading(true)
        setLeftPageBtn(page >= 1)
        getCharacterSheets(page, 6).then((response) => 
        {
        if (!response.ok)
        {
            setError("Sheets could not be retrieved from the server.")
            console.log(response.status)
            return
        }
        //Run normal functionality
        response.json().then((json) => 
        {
            const sheets = json.sheets;
            sheets.pop();
            if(sheets.length === 6)
            {
                sheets.pop();
                setRightPageBtn(true);
                setSheets(sheets)
                setLoading(false)
                return
            }
            setRightPageBtn(false);
            setSheets(sheets);
            setLoading(false)
        })}    
    )}, [page]);

    return <Grid sx={{marginTop: '10%'}} width={'75%'}>
        {(error && !loading) ? <Alert severity={'error'}>{error}</Alert> : <></>}
        {(loading && !error) ? <CircularProgress>Loading Character Sheets</CircularProgress> : <></>}
        {sheets ? sheets.map(function (sheet)
        {
            return <CharacterSheet characterSheet={sheet}/>
        }) 
        : <></>
        }
        <Grid width={'100%'} container justifySelf={'center'} justifyContent={'center'} alignSelf={'center'}>
        {leftPageBtn ? <Button onClick={function(event) {event.preventDefault(); setPage(page - 1)}}>Previous</Button> : <></>}
        {rightPageBtn ? <Button onClick={function(event) {event.preventDefault(); setPage(page + 1)}}>Next</Button> : <></>}
        </Grid>
    </Grid>
}

//An individual character sheet link
function CharacterSheet(props)
{
    const [image, setImage] = useState(null);
    getPictureOfSheet(props.characterSheet._id).then(async function (res)
    {
        //Not all that complete, need to return after image uploads are done
        if (res.ok)
        {
            const json = res.json()
            setImage(json.image) 
        }
        else 
        {
            console.log("Error retrieving character sheet picture for character ID " + props.characterSheet._id + ". Status returned is " + res.status);
        }
    })

    return (
        <Grid container spacing={0} alignItems={'flex'} flexDirection={'row'} sx={{marginTop: '0%', height: '15vh'}} width={'100%'} backgroundColor={"#ffffff"}>
        <div className="imageContainer">
            <img></img>
        </div>
        <CharacterInfo characterSheet={props.characterSheet}/>
        </Grid>)
}

function CharacterInfo(props)
{
    const navigate = useNavigate();

    const GoToCharacterSheet = function(event) 
    {
        event.preventDefault();
        navigate("/user/sheets", { state: {charSheetID: props.characterSheet._id} })
    }
    const dateArray = props.characterSheet.updatedAt.split('T');
    const dateString = dateArray[0];
    return (<Grid sx={{width: '70%', height: '100%', marginTop: '0%'}} container flexDirection={'column'} alignItems={'flex-start'} backgroundColor='#ffffff'>
        <Button onClick={GoToCharacterSheet} key='Character' sx={{color: '#000000', '&:hover': {color: '#ffffff', backgroundColor: '#000000'}}}>{props.characterSheet.sheet.characterName}</Button>
        <Typography key='system' className="SystemName" color={'#000000'}>{props.characterSheet.game.name}</Typography>
        <Typography key='date' className="Date" variant="subtitle2" color={'#000000'}>{"Last Used " + dateString}</Typography>
    </Grid>)
}

export default CharacterSheetHomePage