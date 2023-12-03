import { Button, CircularProgress, Divider, FormControl, FormControlLabel, Grid, List, ListItem, ListItemText, Menu, MenuItem, Radio, RadioGroup, Tab, Tabs, TextField, ThemeProvider, Typography, createTheme } from "@mui/material"
import { useEffect, useState } from "react"
import './DeathInSpaceCharacterSheet.css'
import DISStatsContainer from './CharacterSheetMedia/DISStatsContainer.png'
import { UploadCharacterPic, getCharacterSheetPicture, getDISOrigins, patchSheet } from "../api.mjs"
import { useLocation } from "react-router"


const URL = process.env.REACT_APP_URL
const domain = process.env.REACT_APP_FULL_DOMAIN_NAME

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
            },
        }
})


function DeathInSpaceCharacterSheet (props)
{
    return <ThemeProvider theme={theme}>
    <Grid marginTop={'5%'} backgroundColor={'#f5f6f7'} height={'100%'} width={'80%'} container flexDirection={'row'}>
        <LeftSideOfSheet characterInfo={props.stats}/>
        <RightSideOfSheet characterInfo={props.stats}/>
    </Grid>
    </ThemeProvider>
}

function LeftSideOfSheet(props)
{
    return <Grid container height={'100%'} flexDirection={'column'} borderRight={3} borderColor={'#000000'} width={'50%'}>
        <Typography borderColor={'#000000'} borderBottom={6} textAlign={'center'} width={'100%'} height={'10%'} fontSize={'2rem'}>Death In Space</Typography>
        <BelowTitleContent characterInfo = {props.characterInfo}/>
    </Grid>
}

function BelowTitleContent(props)
{
    return <Grid sx={{marginBottom: '0'}} container height={'89%'} flexDirection={'row'}>
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
    const [imageExists, setImageExists] = useState(false)

    const submitPicture = function() 
    {
        UploadCharacterPic(props.characterInfo._id, document.getElementById("picFile").files[0]).then((resp) =>
        {
            if (!resp.ok)
            {
                resp.json().then((json) => 
                {
                    console.log("Error uploading a character picture with status: " + resp.status)
                    if (json.body)
                    {
                        console.log(json.body)
                    }
                    if (json.errors)
                    {
                        console.log(json.errors)
                    }
                    
                })
                
            }
        })
    }

    useEffect(function ()
    {
        getCharacterSheetPicture(props.characterInfo._id).then(function(resp)
        {
            setImageExists(199 < parseInt(resp.status) && parseInt(resp.status) < 300)
            console.log("Response status: " + resp.status)
        })
    }, [])

    return <Grid container height={'25%'} width={'100%'} flexDirection={'column'} borderRight={5} borderColor={'#000000'} borderBottom={5}>
        <div className="characterImageContainer">
            {(imageExists) ? 
            <img className="characterPicture" src={`${URL}/api/sheets/${props.characterInfo._id}/pic`}></img> : 
            <Grid>
            <input id="picFile" maxLength={"100%"} type="file" accept="image/*"></input>
            <Button onClick={() => {submitPicture()}}>Submit Portrait</Button>
            </Grid>}
        </div>
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
    
    return <Grid>
        <ExperienceAndDefenseRating characterInfo={props.characterInfo}/>
        <Typography  marginTop={'2%'} marginBottom={'2%'} fontWeight={'bold'}>Origin Benefit:</Typography>
        <FormControl
            width={'100%'}
            height={'20%'}
            sx={{marginBottom: '0'}}
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
        if (parseInt(event.target.value) && parseInt(event.target.value) >= 0)
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
        if (parseInt(event.target.value) && 0 <= parseInt(event.target.value) <= maxHealth)
        {
            setcurrentHealth(parseInt(event.target.value))
        }
    }
    
    const changeMaxHealth = function(event)
    {
        event.preventDefault();
        if (parseInt(event.target.value) && parseInt(event.target.value) >= 0)
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
    //Tracks which page we are on. Either we are on "Inventory", "Background Information", or "Current Situation" stats
    const [page, setPage] = useState("Inventory")

    const handleChange = function(event, newPage)
    {
        event.preventDefault();
        setPage(newPage)
        
    }

    return <Grid height={'100%'} width={'50%'}>
        <Grid height={'10%'}>
            <Tabs
            value={page}
            onChange={handleChange} 
            variant='fullWidth'>
                <Tab disabled={page === "Inventory"} value={"Inventory"} label="Inventory"/>
                <Tab disabled={page === "Background Info"} value={"Background Info"} label="Background Info"/>
                {/* <Tab disabled={page === "Current Situation"} value={"Current Situation"} label="Current Situation"/> */}
                <Tab disabled={page === "QR Code"} value={"QR Code"} label="QR Code"/>
            </Tabs>
        </Grid>
        <Grid container justifyContent={'center'} alignItems={'center'} height={'90%'}>
        {
            (page === "Inventory") ? <InventoryAndArmor characterInfo={props.characterInfo}/> : <></>
        }
        {
            (page === "Background Info") ? <BackgroundInfo characterInfo={props.characterInfo}/> : <></>
        }
        {/* {
            (page === "Current Situation") ? <CurrentSituation characterInfo={props.characterInfo}/> : <></>
        } */}
        {
            (page === "QR Code") ? <QRCode characterInfo={props.characterInfo}/> : <></>
        }
        </Grid>
    </Grid>
}

function QRCode(props)
{
    const [copied, setCopied] = useState(false)
    const copytoClipboard = function()
    {
        navigator.clipboard.writeText(document.getElementById("linkName").value)
        setCopied(true)
    }


    return <Grid item justifySelf={'center'} alignSelf={'center'} width={'40%'} height={'50%'}>
        <img className="qrCode" src={`${URL}/api/sheets/${props.characterInfo._id}/qr`}/>
        <Typography>Share your character sheet</Typography>
        <TextField id="linkName" disabled defaultValue={domain + useLocation().pathname}></TextField>
        <Button onClick={() => {copytoClipboard()}}>Copy to Clipboard</Button>
        {(copied) ?
        <Typography>Copied!</Typography> : <></>}
    </Grid>
}

function InventoryAndArmor(props)
{
    const [elementType, setElementType] = useState(null)
    const [showFullData, setShowFullData] = useState(false)
    const [elementID, setElementID] = useState(null)

    useEffect(function ()
    {
        setShowFullData(elementType && elementID)
    }, [elementType, elementID])


    return (<Grid width={'100%'} height={'100%'}>
        {
            (showFullData) ? <FullInformation setElementID={setElementID} setElementType={setElementType} setShowFullData={setShowFullData} elementID = {elementID} elementType = {elementType} characterInfo={props.characterInfo}/>
            :
            <Overview setElementID={setElementID} setElementType={setElementType} characterInfo={props.characterInfo}/>
        }
        
    </Grid>)
}

function FullInformation(props)
{
    
    return (<Grid> 
        {(props.elementType === 'item') ? <ItemInformation setElementType={props.setElementType} setElementID={props.setElementID} setShowFullData={props.setShowFullData} characterInfo={props.characterInfo} elementID = {props.elementID}/> : <></>}
        {(props.elementType === 'armor') ? <ArmorInformation setElementType={props.setElementType} setElementID={props.setElementID} setShowFullData={props.setShowFullData} characterInfo={props.characterInfo} elementID = {props.elementID}/> : <></>}
        {(props.elementType === 'weapon') ? <WeaponInformation setElementType={props.setElementType} setElementID={props.setElementID} setShowFullData={props.setShowFullData} characterInfo={props.characterInfo} elementID = {props.elementID}/> : <></>}
    </Grid>
    )
}

function ItemInformation(props)
{
    const item = props.characterInfo.inventory.find(function(item)
    {
        return item._id === props.elementID; 
    })
    return <Grid>
        <Button onClick={function(event) {event.preventDefault(); props.setShowFullData(false); props.setElementID(null); props.setElementType(null);}}>Back</Button>
        <Typography variant="h4">{item.name}</Typography>
        {(item.cost || item.cost === 0) ? <Typography>Cost: {item.cost} holos</Typography> : <></>}
        {(item.weight || item.weight === 0) ? <Typography>Weight: {item.weight} pounds</Typography> : <></>}
        {(item.condition || item.condition === 0) ? <Typography>Condition: {item.condition}</Typography> : <></>}
        {(item.maxCondition) ? <Typography>Max Condition: {item.maxCondition}</Typography> : <></>}
        {(item.description) ? <Typography>Description: {item.description}</Typography> : <></>}
    </Grid>
}

function ArmorInformation(props)
{
    const item = props.characterInfo.armor.find(function(armor)
    {
        return armor._id === props.elementID; 
    })
    return <Grid>
        <Button onClick={function(event) {event.preventDefault(); props.setShowFullData(false); props.setElementID(null); props.setElementType(null);}}>Back</Button>
        <Typography variant="h4">{item.base.name}</Typography>
        {(item.drBonus) ? <Typography>Defense Rating Bonus: {item.drBonus}</Typography> : <></>}
        {(item.protectsAgainst) ? <Typography>Protects from: {item.protectsAgainst}</Typography> : <></>}
        {(item.type) ? <Typography>Type: {item.type}</Typography> : <></>}
        {(item.equipped) ? <Typography>Equipped</Typography> : <Typography>Not Equipped</Typography>}
        {(item.cost || item.cost === 0) ? <Typography>Cost: {item.cost} holos</Typography> : <></>}
        {(item.weight || item.weight === 0) ? <Typography>Weight: {item.weight} pounds</Typography> : <></>}
        {(item.condition || item.condition === 0) ? <Typography>Condition: {item.condition}</Typography> : <></>}
    </Grid>
}


function WeaponInformation(props)
{
    const item = props.characterInfo.weapons.find(function(item)
    {
        return item._id === props.elementID; 
    })
    return <Grid>
        <Button onClick={function(event) {event.preventDefault(); props.setShowFullData(false); props.setElementID(null); props.setElementType(null);}}>Back</Button>
        <Typography variant="h4">{item.base.name}</Typography>
        {(item.damage) ? <Typography>Damage Bonus: {item.damage}</Typography> : <></>}
        {(item.modifier) ? <Typography>Modifier: {item.modifier}</Typography> : <></>}
        {(item.uses) ? <Typography>Number of Uses: {item.uses}</Typography> : <></>}
        {(item.type) ? <Typography>Type: {item.type}</Typography> : <></>}
        {(item.equipped) ? <Typography>Equipped</Typography> : <Typography>Not Equipped</Typography>}
        {(item.cost || item.cost === 0) ? <Typography>Cost: {item.cost} holos</Typography> : <></>}
        {(item.weight || item.weight === 0) ? <Typography>Weight: {item.weight} pounds</Typography> : <></>}
        {(item.condition || item.condition === 0) ? <Typography>Condition: {item.condition}</Typography> : <></>}
    </Grid>
}


function Overview(props)
{
    return( 
    <Grid width={'100%'} height={'100%'}>
    <Weapons setElementID={props.setElementID} setElementType={props.setElementType} characterInfo={props.characterInfo}/>
    <Armor setElementID={props.setElementID} setElementType={props.setElementType} characterInfo={props.characterInfo}/>
    <Inventory setElementID={props.setElementID} setElementType={props.setElementType} characterInfo={props.characterInfo}/>
    </Grid>
    )
}

function Weapons(props)
{
    const [allowUserInput, setAllowUserInput] = useState(false)


    return <Grid height={'30%'}>
    <Grid container flexDirection={'row'}>
            <Typography width={'60%'} textAlign={'end'} variant='h5'>Weapons:</Typography>
            {(!allowUserInput) ? <Button onClick={() => {setAllowUserInput(true)}} sx={{width: '20%', marginLeft: '20%', textAlign: 'flex-end'}}>Add Weapon</Button> : <></>}
    </Grid>
    {(!allowUserInput) ?
    <List sx=
    {{width: '100%', 
    maxHeight: '20vh', 
    overflow: 'auto',
    '&:hover': {
        cursor: 'pointer'
    }}}>
        {props.characterInfo.weapons.map(function(weapon)
        {
            return (<Grid>
            <ListItem key={`weapon${weapon}` }>
                <ListItemText onClick={function(event) {event.preventDefault(); props.setElementID(weapon._id); props.setElementType('weapon');}} primary={`${weapon.base.name}`}/>
            </ListItem>
            <Divider/>
            </Grid>)
        })}
    </List> : <ManualWeaponInput setAllowUserInput={setAllowUserInput} characterInfo = {props.characterInfo}/>}
    </Grid>
}

function ManualWeaponInput(props)
{
    const [name, setName] = useState("");
    const [damage, setDamage] = useState("");
    const [modifier, setModifier] = useState("");
    const [uses, setUses] = useState("");
    const [type, setType] = useState("");
    const [weight, setWeight] = useState("");

    const handleSubmit = function()
    {
        const newWeapon = {
            base: {
                condition: 0,
                maxCondition: 0,
                cost: 0,
                description: "",
                name: name,
                weight: parseInt(weight),
            },
            equipped: true,
            damage: damage,
            modifier: modifier,
            uses: parseInt(uses),
            type: type
        }
        let copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.weapons.push(newWeapon);
        patchSheet(copyOfCharacterJSON._id, copyOfCharacterJSON).then((r) =>
        {
            if (!r.ok)
            {
                r.json().then((json) =>
                {
                    console.log("Error patching item to the sheet, error code: " + r.status);
                    console.log(json)
                })
            }
            else 
            {
                
                
            }
        })
    }

    const handleNumericChange = function(value, setFunction)
    {
        if (parseInt(value) || value === 0)
        {
            setFunction(value)
        }
        else
        {
            setFunction(null);
        }
    }

    return (<Grid container justifyContent={'center'} height={'80%'} width={'100%'} justifySelf={'center'} alignSelf={'center'}>
        <Grid container flexDirection={'row'}>
            <TextField onChange={(e) => {setName(e.target.value)}} sx={{marginRight: '5%'}} label="Weapon Name" size="small"></TextField>
            <TextField onChange={(e) => {handleNumericChange(e.target.value, setDamage)}} label="Damage (Numeric)" size="small"></TextField>
            <ModifierMenu setModifier={setModifier}/>
            <TextField onChange={(e) => {handleNumericChange(e.target.value, setUses)}} label="Uses (Numeric)" size="small"></TextField>
            <TextField onChange={(e) => {handleNumericChange(e.target.value, setWeight)}} label="Weight (Numeric)" size="small"></TextField>
            <TextField onChange={(e) => {setType(e.target.value)}} label="Type" size="small"></TextField>
        </Grid>
        {(name && damage && modifier && weight && uses && type) ?
                <Button onClick={() => {props.setAllowUserInput(false); handleSubmit()}}>Submit</Button> 
                : <Typography color={'#ff0000'}>Check Inputs (Ensure a modifier is selected)</Typography>
        }
    </Grid>)
}

function ModifierMenu(props)
{
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (stat) => {
    props.setModifier(stat)
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        Modifier
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={(event) => {event.preventDefault(); handleClose('svy')}}>Savvy</MenuItem>
        <MenuItem onClick={(event) => {event.preventDefault(); handleClose('bdy')}}>Body</MenuItem>
        <MenuItem onClick={(event) => {event.preventDefault(); handleClose('tech')}}>Tech</MenuItem>
        <MenuItem onClick={(event) => {event.preventDefault(); handleClose('dex')}}>Dex</MenuItem>
      </Menu>
    </div>
  );
}


function Inventory(props)
{   
    const [allowUserInput, setAllowUserInput] = useState(false)

    return <Grid height={'40%'}>
        <Grid container flexDirection={'row'}>
            <Typography width={'60%'} textAlign={'end'} variant='h5'>Inventory:</Typography>
            {(!allowUserInput) ? <Button onClick={() => {setAllowUserInput(true)}} sx={{width: '20%', marginLeft: '20%', textAlign: 'flex-end'}}>Add Item</Button> : <></>}
        </Grid>
        {(!allowUserInput) ?
        <List sx=
        {{width: '100%', 
        maxHeight: '25vh', 
        overflow: 'auto',
        '&:hover': {
            cursor: 'pointer'
        }}}>
            {props.characterInfo.inventory.map(function(item, index)
            {
                return (<Grid key={`GridOfinventoryItem${index}`}>
                <ListItem key={`inventoryItem${index}` }>
                    <ListItemText onClick={function(event) {event.preventDefault(); props.setElementID(item._id); props.setElementType('item');}} key={`inventoryItemText${index}`} primary={`${item.name}`}/>
                </ListItem>
                <Divider/>
                </Grid>)
            })}
        </List> : <ManualInputItem setAllowUserInput={setAllowUserInput} characterInfo={props.characterInfo}/>}
    </Grid>
}


function ManualInputItem(props)
{
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [condition, setCondition] = useState("");
    const [maxCondition, setMaxCondition] = useState("");
    const [weight, setWeight] = useState("");
    const [cost, setCost] = useState("");

    const handleSubmit = function()
    {
        const newItem = {
            cost: cost,
            name: name,
            weight: weight,
            description: description,
            condition: condition,
            maxCondition: maxCondition
        }
        let copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.inventory.push(newItem);
        patchSheet(copyOfCharacterJSON._id, copyOfCharacterJSON).then((r) =>
        {
            if (r.ok)
            {
                r.json().then((json) =>
                {
                    console.log("New inventory for this player is: ")
                    console.log(json.inventory);
                })
            }
            else 
            {
                console.log("Error patching item to the sheet, error code: " + r.status)
            }
        })
    }

    const handleNumericChange = function(value, setFunction)
    {
        if (parseInt(value) || parseInt(value) === 0)
        {
            setFunction(value)
        }
        else
        {
            setFunction(null)
        }
    }

    return (<Grid container justifyContent={'center'} height={'80%'} width={'100%'} justifySelf={'center'} alignSelf={'center'}>
        <Grid container flexDirection={'row'}>
            <TextField onChange={(e) => {setName(e.target.value)}} sx={{marginRight: '5%'}} label="Item Name" size="small"></TextField>
            <TextField onChange={(e) => {setDescription(e.target.value)}} label="Description" size="small"></TextField>
            <TextField onChange={(e) => {handleNumericChange(e.target.value, setCondition)}} label="Condition (Numeric)" size="small"></TextField>
            <TextField onChange={(e) => {handleNumericChange(e.target.value, setMaxCondition)}} label="Max Condition (Numeric)" size="small"></TextField>
            <TextField onChange={(e) => {handleNumericChange(e.target.value, setWeight)}} label="Weight (Numeric)" size="small"></TextField>
            <TextField onChange={(e) => {handleNumericChange(e.target.value, setCost)}} label="Cost (Numeric)" size="small"></TextField>
        </Grid>
        {(condition && maxCondition && weight && cost) ? 
                <Button onClick={() => {props.setAllowUserInput(false); handleSubmit()}}>Submit</Button>
        : <Typography color={'#ff0000'}>Check Inputs</Typography> 
        }
    </Grid>)
}

function Armor(props)
{
    const [allowUserInput, setAllowUserInput] = useState(false)


    return ((!allowUserInput) ? 
    <Grid height={'30%'}>
        <Grid container flexDirection={'row'}>
            <Typography width={'60%'} textAlign={'end'} variant='h5'>Armor:</Typography>
            <Button onClick={() => {setAllowUserInput(true)}} sx={{width: '20%', marginLeft: '20%', textAlign: 'flex-end'}}>Add Armor</Button>
        </Grid>
        <List sx=
        {{width: '100%', 
        maxHeight: '20vh',
        overflow: 'auto',
        '&:hover': {
            cursor: 'pointer'
        }}}>
            {props.characterInfo.armor.map(function(item)
            {
                return (<Grid>
                <ListItem key={`Armor${item}`}>
                    <ListItemText onClick={function(event) {event.preventDefault(); props.setElementID(item._id); props.setElementType('armor');}} primary={`${item.base.name}`}/>
                </ListItem>
                <Divider/>
                </Grid>)
            })}
        </List>
    </Grid> 
    : <ManualInputArmor setAllowUserInput={setAllowUserInput} characterInfo={props.characterInfo}/>
)
}


function ManualInputArmor(props)
{
    const [name, setName] = useState("");
    const [weight, setWeight] = useState("");
    const [defenseRating, setDefenseRating] = useState(null)
    const [protectsAgainst, setProtectsAgainst] = useState(null)
    const [type, setType] = useState(null)

    const handleSubmit = function()
    {
        const newArmor = {
            base: {
            cost: 0,
            name: name,
            weight: parseInt(weight),
            description: "",
            condition: 0,
            maxCondition: 0
            },
            drBonus: parseInt(defenseRating),
            protectsAgainst: protectsAgainst,
            type: type,
            equipped: true
        }

        let copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.armor.push(newArmor);
        patchSheet(copyOfCharacterJSON._id, copyOfCharacterJSON).then((r) =>
        {
            if (!r.ok)
                console.log("Error patching item to the sheet, error code: " + r.status)
        })
    }

    const handleNumericChange = function (value, setFunction) {
        if(parseInt(value) || parseInt(value) === 0)
        {
            setFunction(value);
        }
        else
        {
            setFunction(null);
        }
    }

    return (<Grid container justifyContent={'center'} height={'30%'} width={'100%'} justifySelf={'center'} alignSelf={'center'}>
        <Grid container flexDirection={'row'}>
            <TextField onChange={(e) => {setName(e.target.value)}} sx={{marginRight: '5%'}} label="Armor Name" size="small"></TextField>
            <TextField onChange={(e) => {handleNumericChange(e.target.value, setWeight)}} sx={{marginRight: '5%'}} label="Weight (Numeric)" size="small"></TextField>
            <TextField onChange={(e) => {handleNumericChange(e.target.value, setDefenseRating)}} label="DefenseRating (Numeric)" size="small"></TextField>
            <TextField onChange={(e) => {setProtectsAgainst(e.target.value)}} label="Protects Against" size="small"></TextField>
            <TextField onChange={(e) => {setType(e.target.value)}} label="Type" size="small"></TextField>
        </Grid>
        {(weight && defenseRating && protectsAgainst && name) ?
                <Button onClick={() => {props.setAllowUserInput(false); handleSubmit()}}>Submit</Button>
                :
                <Typography color={'#ff0000'}>Check Inputs</Typography>
            }
    </Grid>)
}


function BackgroundInfo(props)
{

    const [drive, setDrive] = useState(props.characterInfo.drive)
    const [allegiance, setAllegiance] = useState(props.characterInfo.pastAllegiance)
    const [background, setBackground] = useState(props.characterInfo.background)

    const changeDrive = function(event)
    {
        event.preventDefault();
        setDrive(event.target.value)
    }

    const changeAllegiance = function(event)
    {
        event.preventDefault();
        setAllegiance(event.target.value)
    }

    const changeBackground = function(event)
    {
        event.preventDefault();
        setBackground(event.target.value)
    }

    useEffect(function() {
        const copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.background = background;
        
        patchSheet(props.characterInfo._id, copyOfCharacterJSON).then(function (resp)
        {
            resp.json().then(function (json)
            {
                if (!(json.background === copyOfCharacterJSON.background))
                {
                    console.log("Error when setting background, returned value is not the modified value.")
                    console.log("Returned background: " + json.background)
                    console.log("Updated background: " + copyOfCharacterJSON.background)
                }
            })
        })
    }, [background])


    useEffect(function() {
        const copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.drive = drive;
        
        patchSheet(props.characterInfo._id, copyOfCharacterJSON).then(function (resp)
        {
            resp.json().then(function (json)
            {
                if (!(json.drive === copyOfCharacterJSON.drive))
                {
                    console.log("Error when setting drive, returned value is not the modified value.")
                    console.log("Returned drive: " + json.drive)
                    console.log("Updated drive: " + copyOfCharacterJSON.drive)
                }
            })
        })
    }, [drive])


    useEffect(function() {
        const copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.pastAllegiance = allegiance;
        
        patchSheet(props.characterInfo._id, copyOfCharacterJSON).then(function (resp)
        {
            resp.json().then(function (json)
            {
                if (!(json.pastAllegiance === copyOfCharacterJSON.pastAllegiance))
                {
                    console.log("Error when setting past allegiance, returned value is not the modified value.")
                    console.log("Returned background: " + json.pastAllegiance)
                    console.log("Updated background: " + copyOfCharacterJSON.pastAllegiance)
                }
            })
        })
    }, [allegiance])


    return (
    <Grid height={'100%'}>
        <Grid height={'20%'} width={'100%'} container flexDirection={'row'}>
            <TextField variant="filled" onChange={changeDrive} value={drive} sx={{width: '40%', marginRight: '10%'}} label="Drive" size="small"/>
            <TextField onChange={changeAllegiance} value={allegiance} sx={{width: '40%', marginLeft: '10%'}} variant="filled" label="Past Allegiance" size="small"/>
        </Grid>
        <Grid height={'30%'} width={'100%'} container flexDirection={'row'}>
            <Origin characterInfo={props.characterInfo}/>
        </Grid>
        <Grid height={'50%'} width={'100%'}>
            <Typography>Background</Typography>
            <TextField value={background} onChange={changeBackground} multiline rows={10} fullWidth sx={{maxHeight: '100%'}}></TextField>
        </Grid>
    </Grid>)
}

function Origin(props)
{
    const [OriginDescription, setOriginDescription] = useState(props.characterInfo.origin.description)
    const [anchorEl, setAnchorEl] = useState(null);
    const [origins, setOrigins] = useState([]);
    const [currOrigin, setCurrOrigin] = useState(props.characterInfo.origin.name)
    const [originsLoaded, setOriginsLoaded] = useState(false)

    useEffect(function()
    {
        getDISOrigins({page: 0, limit: 100000}).then(function (resp)
        {
            if (resp.ok)
            {
                resp.json().then(function (json)
                {
                    setOrigins(json.records)
                    setOriginsLoaded(true);
                })
            }
            else
                console.log("Getting DiS origins failed.")
        })
    }, [])


    useEffect(function()
    {
        if (origins.length > 0)
        {
            const currOriginJSON = origins.find((element) => element.name === currOrigin)
            setOriginDescription(currOriginJSON.description);
            const copyOfCharacterJSON = props.characterInfo;
            copyOfCharacterJSON.origin = currOriginJSON;
            patchSheet(copyOfCharacterJSON._id, copyOfCharacterJSON).then(function(resp)
            {
                if (resp.ok)
                {
                    resp.json().then(function (json)
                    {
                        if (!(json.origin.name === copyOfCharacterJSON.origin.name))
                        {
                            console.log("Error. Updated value is not returned value.");
                            console.log("Updated value: " + copyOfCharacterJSON.origin.name)
                            console.log("Returned value: " + json.origin.name)
                        }
                    })
                }
                else
                    console.log("Error when updating origin. Error code: " + resp.status)
            })
        }
    }, [currOrigin, origins])


    const changeOrigin = function (event)
    {
        event.preventDefault();
        const {myValue} = event.currentTarget.dataset
        setCurrOrigin(myValue)
        setAnchorEl(null);
    }


    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
      };
    //Drop Down menu provided by MaterialUI documentation
    return (
        <Grid container flexDirection={'row'}>
        { (originsLoaded) ?
        <div className="selectOrigin">
            <Button
                aria-controls={open ? 'fade-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                Origins
            </Button>
            <Menu
                MenuListProps={{
                'aria-labelledby': 'fade-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                {origins.map(function (origin)
                {
                    return <MenuItem key={`${origin.name}`} data-my-value={origin.name} onClick={changeOrigin}>{origin.name}</MenuItem>
                })}
            </Menu>
            <Grid marginTop={'5%'} container flexDirection={'row'}>
                <Typography marginRight={'5%'}>Current Origin: </Typography>
                <Typography>{currOrigin}</Typography>
            </Grid> 
        </div>
        : <CircularProgress/>
        }
        <TextField disabled value={OriginDescription} sx={{justifySelf: 'flex-end', width: '50%'}} multiline rows={4}></TextField>
        </Grid>
    )
}

function CurrentSituation(props)
{
    return (<Grid height={'90%'}>
        <MutationsList characterInfo={props.characterInfo}/>
        <VoidCorruptions characterInfo={props.characterInfo}/>
        <Money characterInfo={props.characterInfo}/>
    </Grid>)
}

function Money(props)
{
    const [Holos, setHolos] = useState(props.characterInfo.holos)

    const changeHolos = function(event)
    {
        event.preventDefault()
        parseInt(event.target.value) ? setHolos(event.target.value) : setHolos(0)
    }


    useEffect(function ()
    {
        const copyOfCharacterJSON = props.characterInfo;
        copyOfCharacterJSON.holos = Holos
        patchSheet(copyOfCharacterJSON._id, copyOfCharacterJSON).then(function(r)
        {
            if (r.ok)
            {
                r.json().then(function (j)
                {
                    if (!(parseInt(copyOfCharacterJSON.holos) === parseInt(j.holos)))
                    {
                        console.log("Error updating origin benefit. Returned value not the same as updated value.")
                        console.log("Returned value: "  + j.holos);
                        console.log("Updated value: " + copyOfCharacterJSON.holos)
                    }
                })
            }
            else    
                console.log("Error when updating origin benefit. Error code: " + r.status);
        })
    }, [Holos])

    return (<Grid container flexDirection={'row'} alignItems={'center'} justifyContent={'center'}>
        <TextField onChange={changeHolos} defaultValue={Holos} variant="filled" label="Holos" sx={{width: '50%'}}></TextField>
    </Grid>)
}

function VoidCorruptions(props)
{
    return <Grid height={'47%'}>
         <Typography textAlign={'center'} variant="h5">Void Corruption:</Typography>
         <List sx=
        {{width: '100%', 
        maxHeight: '70%', 
        overflow: 'auto'}}>
            {props.characterInfo.corruption.map(function(corruption, index)
            {
                return (<Grid>
                <ListItem key={`Corruption${index}`}>
                    <ListItemText primary={`${corruption.name}`}/>
                </ListItem>
                <Divider/>
                </Grid>)
            })}
        </List>
    </Grid>
}

function MutationsList(props)
{
    return <Grid height={'47%'}>
        <Typography textAlign={'center'} variant="h5">Mutations</Typography>
        <List sx=
        {{width: '100%', 
        maxHeight: '70%', 
        overflow: 'auto'}}>
            {props.characterInfo.mutations.map(function(mutation, index)
            {
                return (<Grid>
                <ListItem key={`Mutation${index}`}>
                    <ListItemText primary={`${mutation.name}`}/>
                </ListItem>
                <Divider/>
                </Grid>)
            })}
        </List>
    </Grid>
}


export default DeathInSpaceCharacterSheet