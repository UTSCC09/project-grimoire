import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Home';
import Template from './Template/Template';
import { ThemeProvider, createTheme } from '@mui/material';
import CharSheetView from './charSheets/CharSheetView';
import Login from './Login';

function getRoutes(){
  return (
    <>
    <Route path="/" element={<Home/>}/>
    <Route path='/login' element={<Login/>}/>
    <Route path='/user/sheets' 
      element={<CharSheetView/>}/>
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
