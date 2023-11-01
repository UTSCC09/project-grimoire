import { Typography } from "@mui/material";
import React from "react";

export function SheetCard(props){
    <Card>
        <Typography>
            {props.gameName}
        </Typography>
        <Typography>
            {props.charName}
        </Typography>
    </Card>
}

export default SheetCard