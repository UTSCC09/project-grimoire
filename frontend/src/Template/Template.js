import React from "react";
import NavBar from "./NavBar";

function Template(props){
    return(
        <>
        <NavBar/>
        {props.children}
        </>
    )
}

export default Template