import {React, useState, useEffect} from "react"
import { useNavigate } from "react-router";
import {Button, Typography, Grid, ImageList, ImageListItem} from "@mui/material"
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import ghostPic from "../media/ghostSkin.png"
import GhostDescription from "../media/GhostDescription.png"
import werewolfPic from "../media/werewolfSkin.png"
import WerewolfDescription from "../media/WerewolfDescription.png"
import witchPic from "../media/witchSkin.png"
import WitchDescription from "../media/WitchDescription.png"


//The following JSONs should contain all media file locations of any required pictures
//stats array is a tuple of order (Hot, Cold, Volatile, Dark)
const MonsterHeartsJSON = {
    Ghost: {CharacterPic: ghostPic,
    title: "Ghost",
    DescriptionPic:  GhostDescription,
    statsOptions: [[-1, 2, -1, 1], [-1, -1, 1, 2]],
    moveList: ["Unresolved Trauma", "Helpful Spirit", "Transference",
                "Projected Blame", "Creep", "Limitless"],
    RequiredMove: [true, false, false, false, false, false],
    MovestoPick: 3},
    Werewolf: {CharacterPic: werewolfPic,
    title: "Werewolf",
    DescriptionPic: WerewolfDescription},
    Witch: {CharacterPic: witchPic,
    title: "Witch",
    DescriptionPic: WitchDescription}
}

function CreateCharacter(props){

    //The following determine which character builder to use.
    const [monsterHearts, setMonsterHearts] = useState(false);
    const [deathInSpace, setdeathInSpace] = useState(false);

    return (
    <Grid>
    <Grid>
        <Typography>What game would you like to build a character for?</Typography>
    <Button onClick={(event) => {event.preventDefault(); setMonsterHearts(true); setdeathInSpace(false);}}>Monster Hearts</Button>
    <Button onClick={(event) => {event.preventDefault(); setdeathInSpace(true); setMonsterHearts(false);}}>Death in Space</Button>
    </Grid>
    {monsterHearts ? <MonsterHearts></MonsterHearts> : <></>}
    {deathInSpace ? <DeathinSpace></DeathinSpace> : <></>}
    </Grid>
    )
}

//Load the MonsterHearts character creator. ImageList and ImageList code provided by MaterialUI.
function MonsterHearts(props) {
    const [showCharacterOptions, setshowCharacterOptions] = useState(false);
    const [charChosen, setcharChosen] = useState("")

    //Turn to array so we can map
    const MonsterHeartsArray = Object.values(MonsterHeartsJSON);
    
    return <Grid>
        <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
  {MonsterHeartsArray.map(function (skin) {
    return (<ImageListItem key={skin.title}>
        <img
        src={skin.CharacterPic}
        alt={skin.title}
        onClick={function (e) {e.preventDefault(); setshowCharacterOptions(true); setcharChosen(skin.title)}}
        loading="lazy"/>
    </ImageListItem>)
  })}
</ImageList>
{ showCharacterOptions ?
    <CharacterOptions game={"MonsterHearts"} character={charChosen}></CharacterOptions> 
    : <></>
}
    </Grid>
}

function DeathinSpace (props)
{
    return <></>
}

function CharacterOptions(props)
{
    if (props.game === "MonsterHearts")
    {
        return (
            <Grid>
            <Description character = {props.character}></Description>
            <StatChoices character = {props.character}></StatChoices>
            <MoveChoices character = {props.character}>pp</MoveChoices>
            </Grid>
        )
    }
}

function Description(props)
{
    return (<img src={MonsterHeartsJSON[props.character].DescriptionPic}
            alt={`${props.character} Description`}>
    </img>)
}

function StatChoices(props)
{
    const [statsIndex, changeStatsIndex] = useState(0);

    const handleClick = function () {
        if (statsIndex === 0)
        {
            changeStatsIndex(1);
        }
        else if (statsIndex === 1)
        {
            changeStatsIndex(0);
        }
    }

    return (<Grid><Typography>Hot: {MonsterHeartsJSON[props.character].statsOptions[statsIndex][0]}, 
            Cold: {MonsterHeartsJSON[props.character].statsOptions[statsIndex][1]}, 
            Volatile: {MonsterHeartsJSON[props.character].statsOptions[statsIndex][2]}, 
            Dark: {MonsterHeartsJSON[props.character].statsOptions[statsIndex][3]}</Typography>
            <Button onClick={function (e) {e.preventDefault(); handleClick();}}>Change Stats</Button>
            </Grid>)
}

function MoveChoices(props)
{
    const lengthofMoveList = MonsterHeartsJSON[props.character].moveList.length;
    const [switchesFilled, setswitchesFilled] = useState(Array(lengthofMoveList).fill(false));
    const [numSwitchesFlipped, setnumSwitchesFlipped] = useState(0);

    const navigate = useNavigate()

    const handleMoveSelect = function (index) {
        const switchIndFlipped = switchesFilled;
        switchIndFlipped[index] = !switchesFilled[index];
        setswitchesFilled(switchIndFlipped);
    }

    const updatenumSwitchesFlipped = function () {
        let count = 0;
        switchesFilled.map(function(switch_flipped)
        {
            if (switch_flipped)
            {
                count++;
            }
            return
        })
        setnumSwitchesFlipped(count);
    }

    const checkNumberOfMoves = function () {
        if (numSwitchesFlipped > MonsterHeartsJSON[props.character].MovestoPick)
        {
            console.log("An error has occurred as a result of too many moves having been picked")
            return false;
        }
        return (numSwitchesFlipped === MonsterHeartsJSON[props.character].MovestoPick)
    }

    const handleMovesSubmit = function () {
        if (checkNumberOfMoves())
        {

            navigate("/CharacterSheetHomePage")
        }
    }

    return (<FormGroup>
        {MonsterHeartsJSON[props.character].moveList.map(function (move, index)
        {
            if(MonsterHeartsJSON[props.character].RequiredMove[index])
            {

                return <FormControlLabel control={<Switch defaultChecked />} label={move} disabled></FormControlLabel>
            }
            else
                return <FormControlLabel control={<Switch/>} label={move} onClick={function (e) {handleMoveSelect(index); updatenumSwitchesFlipped();}}></FormControlLabel>
        })
        }
        <FormControlLabel control={<Button onClick={function (e) {e.preventDefault();
                //TODO: Post the MonsterHearts Data here.
                navigate("/CharacterSheetHomePage");
                }}>Submit</Button>}></FormControlLabel>
    </FormGroup>)
}


export default CreateCharacter