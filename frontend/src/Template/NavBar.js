import {React, useEffect, useState} from "react";
import {Box, Grid, Button, Menu, MenuItem} from '@mui/material'
import "./template.css"
import { getCurrentUser, logOut } from "../api.mjs";
import { useNavigate } from "react-router";



function NavBar(props){
    //For determining the text that should be displayed in the dropdown menu and 
    //the links and functions handled upon clicking that, we use the following schema
    // jsonOptions := {ArrayOfDropDownTextToDisplay, ArrayofFunctionsOnClick}
    //where ArrayofFunctionsOnClick[i] is the function performed when ArrayOfDropDownTextToDisplay[i]
    //is clicked

    //In case of a button performing a function instead of traversing to a different link
    //use the functionNameArray and functionArray names and pass them as onClick handlers
    //for those buttons.
    const [username, setusername] = useState(getCurrentUser());
    
    window.addEventListener('storage', function (event) {
      if (event.key === 'username') {
        setusername(event.newValue);
      }
    });
    const navigate = useNavigate();
    const signOut = function () {
      logOut().then(function (resp)
      {
        if(!resp.ok)
        {
          console.log("Server connection error")
          return;
        }
        console.log("Successful sign out");
        setusername(null);
        navigate("/")
      })
    };

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
    const accountJSON = {
      textArray: ["Your Info"],
      linksArray: ["/accountInfo"],
      functionNameArray: ["Sign Out"],
      functionArray: [signOut]
    }

    

    

    return(
    <Box className="basic-box">
        <Grid item container xs={2} className='logo-box'>
            <Button onClick={event => window.location.href="./"}>Grimoire</Button>
        </Grid>
        <Grid item container xs={10} className="nav-box">
        <DropDownMenu ButtonText ="Sign Up/Log In" statePassArray={LogUserJSON.statePass} DropDownArray={LogUserJSON.textArray} linksArray={LogUserJSON.linksArray}/>
        <DropDownMenu ButtonText ="Character Sheet" DropDownArray={CharacterJSON.textArray} linksArray={CharacterJSON.linksArray}/>
        <DropDownMenu ButtonText ="Games" DropDownArray={lfgJSON.textArray} linksArray={lfgJSON.linksArray}/>
        {
          username ?
        <DropDownMenu ButtonText={username} DropDownArray={accountJSON.textArray} linksArray={accountJSON.linksArray} functionNamesArray={accountJSON.functionNameArray} functionsArray = {accountJSON.functionArray}></DropDownMenu> :
        <></>
        }
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
  const navigate = useNavigate();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  let ArraytoInsert = [];
  let functionButtonsArray = [];
  if(props.DropDownArray)
  {
    ArraytoInsert = props.DropDownArray.map(function (s, index) 
      {
          return <MenuItem key= {s} onClick={(event) => {event.preventDefault(); navigate(props.linksArray[index]);}}>{s}</MenuItem>
      })
  }
  if(props.functionsArray)
  {
    functionButtonsArray = props.functionsArray.map(function (s, index)
    {
      return <MenuItem key= {props.functionNamesArray[index]} onClick={(event) => {event.preventDefault(); s();}}>{props.functionNamesArray[index]}</MenuItem>
    })
  }
  const totalArray = ArraytoInsert.concat(functionButtonsArray)

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
        
        {totalArray}
      </Menu>
    </div>
  );
}

export default NavBar