import { Box, Typography} from "@mui/material";
import {React, useState} from "react";

function CharacterSheetView(props){
    const [sheets, setSheets] = useState([])
    
    function getSheets(){
        setSheets([])
    }

    return(
        <Box>
            <Typography>
                Your Charactersheets
            </Typography>        
            {sheets.length > 0 ? 
            <>
                {
                    sheets.map((sheet) => {
                        //<SheetCard sheet={sheet} name="foo" react={1}/>
                    })
                }
            </>
        : <></>}
        </Box>
    )
}

export default CharacterSheetView