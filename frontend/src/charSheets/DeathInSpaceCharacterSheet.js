import { FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField, ThemeProvider, Typography, createTheme } from "@mui/material"
import { useEffect, useState } from "react"
import './DeathInSpaceCharacterSheet.css'
import DISStatsContainer from './CharacterSheetMedia/DISStatsContainer.png'
import { patchSheet } from "../api.mjs"

const theme = createTheme({
    components:
        {
            MuiGrid:
            {
                styleOverrides:
                {
                    root:
                    {
                        backgroundColor: '#f5f6f7'
                    }
                }
            }
        }
})


function DeathInSpaceCharacterSheet (props)
{
    return <ThemeProvider theme={theme}>
    <Grid marginTop={'5%'} backgroundColor={'#f5f6f7'} height={'80%'} width={'80%'} container flexDirection={'row'}>
        <LeftSideOfSheet characterInfo={props.stats}/>
        <RightSideOfSheet characterInfo={props.stats}/>
    </Grid>
    </ThemeProvider>
}

function LeftSideOfSheet(props)
{
    return <Grid container flexDirection={'column'} borderRight={3} borderColor={'#000000'} width={'50%'}>
        <Typography borderColor={'#000000'} borderBottom={6} textAlign={'center'} width={'100%'} height={'10%'} fontSize={'2rem'}>Death In Space</Typography>
        <BelowTitleContent characterInfo = {props.characterInfo}/>
    </Grid>
}

function BelowTitleContent(props)
{
    return <Grid container height={'89%'} flexDirection={'row'}>
        <Stats characterInfo = {props.characterInfo}/>
        <GeneralCharacterInfo characterInfo = {props.characterInfo}/>
    </Grid>
}

function Stats(props)
{
    return <Grid justifySelf={'flex-end'} borderColor={'#000000'} height={'100%'} borderRight={5} width={'14%'} flexDirection={'column'}>
        <div className="statsContainer">
            <img alt="statsContainer" src={DISStatsContainer} className="statsImage"/>
            <div className="statsText">{props.characterInfo.stats.bdy}</div>
            <Typography color={'#000000'}>Body</Typography>
        </div>
        <div className="statsContainer">
            <img alt="statsContainer" src={DISStatsContainer} className="statsImage"/>
            <div className="statsText">{props.characterInfo.stats.dex}</div>
            <Typography color={'#000000'}>Dexterity</Typography>
        </div>
        <div className="statsContainer">
            <img alt="statsContainer" src={DISStatsContainer} className="statsImage"/>
            <div className="statsText">{props.characterInfo.stats.svy}</div>
            <Typography color={'#000000'}>Savvy</Typography>
        </div>
        <div className="statsContainer">
            <img alt="statsContainer" src={DISStatsContainer} className="statsImage"/>
            <div className="statsText">{props.characterInfo.stats.tech}</div>
            <Typography color={'#000000'}>Tech</Typography>
        </div>
    </Grid>
}

function GeneralCharacterInfo(props)
{
    return <Grid container borderRight={2} borderColor={'#000000'} flexDirection={'column'} width={'85.95%'}>
        <CharacterNameAndPic characterInfo = {props.characterInfo}/>
        <CurrentStatus characterInfo = {props.characterInfo}/>
        <GeneralInformation characterInfo={props.characterInfo}/>
    </Grid>
}

function CharacterNameAndPic(props)
{
    return <Grid container height={'25%'} width={'100%'} flexDirection={'column'} borderRight={5} borderColor={'#000000'} borderBottom={5}>
        <div className="characterImageContainer"></div>
        <CharacterInfoText characterInfo = {props.characterInfo}/>
    </Grid>
}

function CharacterInfoText(props)
{
    return <Grid width={'71%'} height={'100%'}>
        <Grid alignItems={'center'} container flexDirection={'row'} height={'33%'} width={'100%'}>
            <Typography width={'20%'} fontWeight={'bold'} fontSize={'100%'} >Name:</Typography>
            <Typography>{props.characterInfo.characterName}</Typography>
        </Grid>
        <Grid alignItems={'center'} container flexDirection={'row'} height={'33%'} width={'100%'}>
            <Typography width={'20%'} fontWeight={'bold'} fontSize={'100%'} >Looks:</Typography>
            <Typography>{props.characterInfo.looks}</Typography>
        </Grid>
        <Grid alignItems={'center'} container flexDirection={'row'} height={'33%'} width={'100%'}>
            <Typography width={'20%'} fontWeight={'bold'} fontSize={'100%'} >Origin:</Typography>
            <Typography>{props.characterInfo.origin.name}</Typography>
        </Grid>
    </Grid>
}


function CurrentStatus(props)
{
    return <Grid container alignItems={'center'} width={'100%'} height={'20%'} flexDirection={'column'}>
        <CurrentHealth characterInfo={props.characterInfo}/>
        <CurrentLifeSupport characterInfo={props.characterInfo}/>
    </Grid>
}

function GeneralInformation(props)
{

    const [option, setOption] = useState(parseInt(props.characterInfo.originBenefit));

    const handleChange = function (event)
    {
        setOption(parseInt(event.target.value));
    }

    useEffect(function ()
    {
        const copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.originBenefit = option
        patchSheet(copyOfCharacterJSON._id, copyOfCharacterJSON).then(function(r)
        {
            if (r.ok)
            {
                r.json().then(function (j)
                {
                    if (!(parseInt(copyOfCharacterJSON.originBenefit) === parseInt(j.originBenefit)))
                    {
                        console.log("Error updating origin benefit. Returned value not the same as updated value.")
                        console.log("Returned value: "  + j.originBenefit);
                        console.log("Updated value: " + copyOfCharacterJSON.originBenefit)
                    }
                })
            }
            else    
                console.log("Error when updating origin benefit. Error code: " + r.status);
        })
    }, [option])
    console.log(props.characterInfo)
    
    return <Grid>
        <ExperienceAndDefenseRating characterInfo={props.characterInfo}/>
        <Typography  marginTop={'2%'} marginBottom={'2%'} fontWeight={'bold'}>Origin Benefit:</Typography>
        <FormControl
            width={'100%'}
            height={'20%'}
        >
            <RadioGroup
                value={option}
                onChange={handleChange}
            >
                <FormControlLabel value={0} label={props.characterInfo.origin.benefits[0].name} control={<Radio/>}/>
                <FormControlLabel value={1} label={props.characterInfo.origin.benefits[1].name} control={<Radio/>}/>
            </RadioGroup>
        </FormControl>
        <TextField disabled value={props.characterInfo.origin.benefits[option].description} multiline rows={3}
        sx={{width: '100%', "& .MuiInputBase-root": {height: 103, justifyContent: 'flex-start', alignItems: 'flex-start'}}}></TextField>
    </Grid>
}

function ExperienceAndDefenseRating(props)
{
    const [experience, setExperience] = useState(props.characterInfo.experiencePoints);
    const [defenseRating, setDefenseRating] = useState(props.characterInfo.defenseRating);
    
    const changeExperience = function(event)
    {
        event.preventDefault();
        if (parseInt(event.target.value))
        {
            setExperience(parseInt(event.target.value))
        }
    }

    const changeDefenseRating = function(event)
    {
        event.preventDefault();
        if (parseInt(event.target.value) && parseInt(event.target.value) >=7)
        {
            setDefenseRating(parseInt(event.target.value))
        }
    }

    useEffect(function() 
    {
        const copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.experiencePoints = experience
        patchSheet(props.characterInfo._id, copyOfCharacterJSON).then(function(resp)
        {
            if (resp.ok)
            {
                resp.json().then(function (json)
                {
                    
                    if (!(parseInt(copyOfCharacterJSON.experiencePoints) === parseInt(json.experiencePoints)))
                    {
                        console.log("Error when updating experience points. Returned value does not match updated value")
                        console.log("Returned value: " + copyOfCharacterJSON.experiencePoints)
                        console.log("Updated Value: " + json.experiencePoints)
                    }
                })
            }
            else
            {
                console.log("Error when changing experience: " + resp.status);
            }
        })
    }, [experience])

    useEffect(function() 
    {
        const copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.defenseRating = defenseRating;
        patchSheet(props.characterInfo._id, copyOfCharacterJSON).then(function(resp)
        {
            if (resp.ok)
            {
                resp.json().then(function (json)
                {
                    
                    if (!(parseInt(copyOfCharacterJSON.defenseRating) === parseInt(json.defenseRating)))
                    {
                        console.log("Error when updating experience points. Returned value does not match updated value")
                        console.log("Returned value: " + copyOfCharacterJSON.experiencePoints)
                        console.log("Updated Value: " + json.experiencePoints)
                    }
                })
            }
            else
            {
                console.log("Error when changing defense rating. Resp status:" + resp.status);
            }
        })
    }, [defenseRating])


    return (<Grid container flexDirection={'row'} width={'100%'}>
        <Grid container width={'40%'} marginRight={'5%'}>
            <Typography marginTop={'2%'}  marginBottom={'2%'} fontWeight={'bold'}>Experience:</Typography>
            <TextField onChange={changeExperience} defaultValue={experience} size="small"></TextField>
        </Grid>
        <Grid container width={'40%'} marginLeft={'5%'}>
            <Typography marginTop={'2%'} marginBottom={'2%'} fontWeight={'bold'}>Defense Rating:</Typography>
            <TextField onChange={changeDefenseRating} defaultValue={defenseRating} size='small'></TextField>
        </Grid>
    </Grid>)
}

function CurrentHealth(props)
{
    const [currentHealth, setcurrentHealth] = useState(props.characterInfo.hitPoints);
    const [maxHealth, setMaxHealth] = useState(props.characterInfo.maxHitPoints)

    const changeHealth = function(event)
    {
        event.preventDefault();
        if (parseInt(event.target.value) && parseInt(event.target.value) <= maxHealth)
        {
            setcurrentHealth(parseInt(event.target.value))
        }
    }
    
    const changeMaxHealth = function(event)
    {
        event.preventDefault();
        if (parseInt(event.target.value))
        {
            setMaxHealth(parseInt(event.target.value))
        }
    }

    useEffect(function() {
        const copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.hitPoints = currentHealth;
        patchSheet(props.characterInfo._id, copyOfCharacterJSON).then(function (resp)
        {
            if (resp.ok)
            {
                resp.json().then(function (json)
                {
                    if (!(parseInt(json.hitPoints) === parseInt(copyOfCharacterJSON.hitPoints)))
                    {
                        console.log("Error when setting current health, returned value is not the wanted value.")
                    }
                })
            }
            else
            {
                console.log("Error when changing current hit points. Resp status:" + resp.status);
            }
        })
    }, [currentHealth])




    useEffect(function() {
        const copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.maxHitPoints = maxHealth;
        patchSheet(props.characterInfo._id, copyOfCharacterJSON).then(function (resp)
        {
            if (resp.ok)
            {
                resp.json().then(function (json)
                {
                    if (!(parseInt(json.maxHitPoints) === parseInt(copyOfCharacterJSON.maxHitPoints)))
                    {
                        console.log("Error when setting max health, returned value is not the wanted value.")
                        console.log("Returned health: " + json.maxHitPoints)
                        console.log("Updated health: " + copyOfCharacterJSON.maxHitPoints)
                    }
                })
            }
            else
            {
                console.log("Error when changing max health. Resp status:" + resp.status);
            }
        })
    }, [maxHealth])

    return <Grid container marginLeft={'10%'} flexDirection={'column'} width={'45%'} alignItems={'center'} height={'100%'}>
        <Typography fontWeight={'bold'} alignSelf={'flex-start'}>Health:</Typography>
        <Grid container flexDirection={'row'} height={'25%'} width={'100%'}>
            <Typography marginRight={'7%'}>Current</Typography>
            <Typography>Max</Typography>
        </Grid>
        <Grid alignItems={'center'} container flexDirection={'row'} width={'100%'} height={'50%'}>
            <TextField onChange={changeHealth} defaultValue={currentHealth} sx={{width: '20%'}}></TextField>
            <Typography fontSize={'2rem'}>/</Typography>
            <TextField onChange={changeMaxHealth} defaultValue={maxHealth} sx={{width: '20%'}}></TextField>
        </Grid>
    </Grid>
}

function CurrentLifeSupport(props)
{
    const [currentLifeSupport, setCurrentLifeSupport] = useState(props.characterInfo.lifeSupport);


    useEffect(function() {
        const copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.lifeSupport = currentLifeSupport;
        
        patchSheet(props.characterInfo._id, copyOfCharacterJSON).then(function (resp)
        {
            resp.json().then(function (json)
            {
                if (!(parseInt(json.lifeSupport) === parseInt(copyOfCharacterJSON.lifeSupport)))
                {
                    console.log("Error when setting life support, returned value is not the modified value.")
                    console.log("Returned life support: " + json.maxHitPoints)
                    console.log("Updated life support: " + copyOfCharacterJSON.maxHitPoints)
                }
            })
        })
    }, [currentLifeSupport])

    const handleLSChange = function(event)
    {
        event.preventDefault();
        if(parseInt(event.target.value) && 0 <= parseInt(event.target.value) <= 100)
             setCurrentLifeSupport(event.target.value)
    }
    return <Grid width={'45%'} height={'100%'}>
        <Typography fontWeight={'bold'} alignSelf={'flex-start'}>Life Support:</Typography>
        <Grid alignItems={'flex-end'} container flexDirection={'row'} width={'100%'} height={'70%'}>
            <TextField onChange={handleLSChange} defaultValue={currentLifeSupport} sx={{width: '25%'}}></TextField>
        </Grid>
    </Grid>
}

function RightSideOfSheet(props)
{
 return <Grid width={'35%'}>

 </Grid>
}



export default DeathInSpaceCharacterSheet