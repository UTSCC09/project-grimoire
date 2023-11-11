import {React, useState} from "react";
import {Box, Grid, Button, Menu, MenuItem} from '@mui/material'
import "./template.css"

function NavBar(props){
    //For determining the text that should be displayed in the dropdown menu and 
    //the links and functions handled upon clicking that, we use the following schema
    // jsonOptions := {ArrayOfDropDownTextToDisplay, ArrayofFunctionsOnClick}
    //where ArrayofFunctionsOnClick[i] is the function performed when ArrayOfDropDownTextToDisplay[i]
    //is clicked
    const LogUserJSON = {
        textArray: ["Log In", "Sign Up"],
        linksArray: ["/login", "/signup"],
    }
    const CharacterJSON = {
      textArray: ["Create a Character", "View Your Characters"],
      linksArray: ["/CreateCharacter", "/CharacterSheetHomePage"]
    }
    const lfgJSON = {
      textArray: ["Look for Game", "Create a Game"],
      linksArray: ["/LookingForGame", "/CreateGame"]
    }

    return(
    <Box className="basic-box">
        <Grid item container xs={2} className='logo-box'>
            <Button onClick={event => window.location.href="./"}>Grimoire</Button>
        </Grid>
        <Grid item container xs={10} className="nav-box">
        <DropDownMenu ButtonText ="Sign Up/Log In" DropDownArray={LogUserJSON.textArray} linksArray={LogUserJSON.linksArray}/>
        <DropDownMenu ButtonText ="Character Sheet" DropDownArray={CharacterJSON.textArray} linksArray={CharacterJSON.linksArray}/>
        <DropDownMenu ButtonText ="Games" DropDownArray={lfgJSON.textArray} linksArray={lfgJSON.linksArray}/>
        </Grid>
        <Grid item container xs={2}>

        </Grid>
    </Box>
    )
}

//DropDownMenu method provided by MaterialUI
function DropDownMenu(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const ArraytoInsert = props.DropDownArray.map(function (s, index) 
    {
        return <MenuItem key= {s} onClick={event => window.location.href=props.linksArray[index]}>{s}</MenuItem>
    })

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {props.ButtonText}
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
        {ArraytoInsert}
      </Menu>
    </div>
  );
}

export default NavBar