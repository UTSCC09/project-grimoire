import {React, useState, useEffect} from "react"
import {Button, Grid, Typography, Alert, CircularProgress} from "@mui/material"
import { getCharacterSheets, getPictureOfSheet } from "../api.mjs"
import "./characterSheetHomePage.css"
import {useLocation, useNavigate} from "react-router-dom"

const URL = process.env.REACT_APP_URL



function CharacterSheetHomePage(props){

    return <Grid spacing={1} minHeight={'100vh'} display="flex" container alignItems={'flex-start'} justifyContent={'center'}>
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

    const navigate = useNavigate()
    const location = useLocation()
    
    useEffect(function () 
    {
        setLoading(true)
        setLeftPageBtn(page >= 1)
        getCharacterSheets(page, 6).then(async (response) => 
        {
        if (!response.ok)
        {
            setLoading(false)
            if(response.status === 401){
                navigate("/login", {state: {path: location.pathname}})
                return
            }
            setError((await response.json()).body)
            console.log(response.status)
            return
        }
        //Run normal functionality
        response.json().then((json) => 
        {
            const sheets = json.sheets;
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
        <Grid width={'100%'} container justifySelf={'center'} justifyContent={'center'} alignSelf={'center'} border="1px blue solid">
        <Button disabled={!leftPageBtn} variant="contained" onClick={function(event) {event.preventDefault(); setPage(page - 1)}}>Previous</Button>
        <Button disabled={!rightPageBtn} variant="contained" onClick={function(event) {event.preventDefault(); setPage(page + 1)}}>Next</Button>
        </Grid>
    </Grid>
}

//An individual character sheet link
function CharacterSheet(props)
{
    return (
        <Grid container spacing={0} alignItems={'flex'} flexDirection={'row'} sx={{marginTop: '0%', height: '15vh'}} width={'100%'} backgroundColor={"#ffffff"}>
        <div className="imageContainer">
            <img className="characterPicture" src={`${URL}/api/sheets/${props.characterSheet.sheet._id}/pic`}></img>
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
        navigate(`/sheets/${props.characterSheet.sheet._id}`);
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