import logo from './logo.svg';
import './styling/App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Home';
import Template from './Template/Template';
import { ThemeProvider, Typography, createTheme } from '@mui/material';
import CharSheetView from './charSheets/CharSheetView';
import LookingForGame from './GameGroups/LookingForGame.js';
import Login from './Login/Login.js';
import SignUp from './Login/SignUp.js';
import CreateGame from './GameGroups/CreateGame.js';
import CreateCharacter from './CharacterManager/CreateCharacter.js'
import CharacterSheetView from './charSheets/CharSheetView.js';
import CharacterSheetHomePage from './CharacterManager/CharacterSheetHomePage';
import DualFactorAuth from './Login/DualFactorAuth.js';

function getRoutes(){
  return (
    <>
    <Route path="/" element={<Home/>}/>
    <Route path='/login' element={<Login/>}/>
    <Route path="/signup" element={<SignUp/>}/>
    <Route path="/LookingForGame" element={<LookingForGame/>}/>
    <Route path="/CreateGame" element={<CreateGame/>}/>
    <Route path="/CreateCharacter" element={<CreateCharacter/>}/>
    <Route path="/CharacterSheetHomePage" element={<CharacterSheetHomePage/>}/>
    <Route path='/user/sheets' element={<CharacterSheetView/>}/>
    <Route path='/DualFactorAuth' element={<DualFactorAuth/>}/>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Template>
      <Routes>
          {getRoutes()}
      </Routes>
      </Template>
    </BrowserRouter>
  );
}

export default App;
