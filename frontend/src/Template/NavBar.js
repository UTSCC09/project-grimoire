import {React, useEffect, useState} from "react";
import {Box, Grid, Button, Menu, MenuItem, createTheme, ThemeProvider, AppBar, Toolbar} from '@mui/material'
import "./template.css"
import { getCurrentUser, logOut } from "../api.mjs";
import { useNavigate } from "react-router";
import styled from "@emotion/styled";
import { grey, red, black} from "@mui/material/colors";
import GrimoireLogo from "../media/grimoireLogo.png"

const theme = createTheme({
    palette: {
      primary: {
        main: "#000000",
        textColor: red[500],
        maxHeight: "10vh",
        position: "fixed",
        hoverColor: "#ffd700 "
      }
    },
    sizing: {
      display: 'flex'
      },
    eventOverrides: {
      ButtonHover: "grab"
    }
});

const CustomButton = styled(Button)(({theme}) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.textColor,
  height: "100%",
  cursor: 'pointer',
  '&:hover': {
    cursor: 'pointer',
    color: theme.palette.primary.hoverColor
  },
  marginLeft: theme.spacing(5)
}));

const CustomGrid = styled(Grid)(({theme}) => ({
  display: theme.sizing.display,
  width: theme.palette.primary.width
}))

const RightCustomButton = styled(Button)(({theme}) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.textColor,
  height: "100%",
  cursor: 'pointer',
  '&:hover': {
    cursor: 'pointer',
    color: theme.palette.primary.hoverColor
  },
  alignSelf: 'right'
}));

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
      textArray: ["Look for a Group", "Create a Group"],
      linksArray: ["/LookingForGame", "/CreateGame"]
    }
    const accountJSON = {
      textArray: ["Your Info"],
      linksArray: ["/accountInfo"],
      functionNameArray: ["Sign Out"],
      functionArray: [signOut]
    }

    

    

    return(
      <ThemeProvider theme = {theme}>
      <AppBar position="sticky">
        <Toolbar disableGutters>
          <Grid item container xs={12} direction ={"row"}>
              <CustomGrid item container xs={8}>
              <img className="logoPicture" src={GrimoireLogo} onClick={event => navigate("./")}/>
              <DropDownMenu ButtonText ="Character Sheet" DropDownArray={CharacterJSON.textArray} linksArray={CharacterJSON.linksArray}/>
              <DropDownMenu ButtonText ="Groups" DropDownArray={lfgJSON.textArray} linksArray={lfgJSON.linksArray}/>
              </CustomGrid>
              <CustomGrid sx={{alignItems:'right', alignSelf: 'right', display:'flex', justifyContent:'flex-end'}} item container xs={4}>
              {
                username ?
              <RightDropDownButton ButtonText={username} DropDownArray={accountJSON.textArray} linksArray={accountJSON.linksArray} functionNamesArray={accountJSON.functionNameArray} functionsArray = {accountJSON.functionArray}/> :
              <RightDropDownButton ButtonText ="Sign Up/Log In" statePassArray={LogUserJSON.statePass} DropDownArray={LogUserJSON.textArray} linksArray={LogUserJSON.linksArray}/>
              }
              </CustomGrid>
          </Grid>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
    )
}

//DropDownMenu skeleton method provided by MaterialUI
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
          return <MenuItem key= {s} onClick={(event) => {event.preventDefault(); navigate(props.linksArray[index]); setAnchorEl(null)}}>{s}</MenuItem>
      })
  }
  if(props.functionsArray)
  {
    functionButtonsArray = props.functionsArray.map(function (s, index)
    {
      return <MenuItem key= {props.functionNamesArray[index]} onClick={(event) => {event.preventDefault(); s(); setAnchorEl(null);}}>{props.functionNamesArray[index]}</MenuItem>
    })
  }
  const totalArray = ArraytoInsert.concat(functionButtonsArray)
  return (
    <div>
      <CustomButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {props.ButtonText}
      </CustomButton>
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

function RightDropDownButton(props)
{
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
          return <MenuItem key= {s} onClick={(event) => {event.preventDefault(); navigate(props.linksArray[index]); setAnchorEl(null)}}>{s}</MenuItem>
      })
  }
  if(props.functionsArray)
  {
    functionButtonsArray = props.functionsArray.map(function (s, index)
    {
      return <MenuItem key= {props.functionNamesArray[index]} onClick={(event) => {event.preventDefault(); s(); setAnchorEl(null)}}>{props.functionNamesArray[index]}</MenuItem>
    })
  }
  const totalArray = ArraytoInsert.concat(functionButtonsArray)

  return (
  <div>
  <RightCustomButton id="basic-button"
  aria-controls={open ? 'basic-menu' : undefined}
  aria-haspopup="true"
  aria-expanded={open ? 'true' : undefined}
  onClick={handleClick}
>
  {props.ButtonText}
</RightCustomButton>
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
</div>)
}

export default NavBar