import { Typography } from "@mui/material";
import React from "react";

export function SheetCard(props){
    <Card>
        <Typography>
            {props.name}
        </Typography>
        <Typography>
            {props.react}
        </Typography>
    </Card>
}

SheetCard.propTypes = {
    name: String
}

export default SheetCard