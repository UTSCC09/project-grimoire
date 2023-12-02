import { Box, Grid, Link, Typography } from "@mui/material";
import React from "react";
import "./styling/general.css"
import { useNavigate } from "react-router";

function Page404(props){
    const navigate = useNavigate()

    return (
    <Grid item container xs={12} className="full-center">
        <Grid item xs={12}>
            <Typography variant="h3" align="center">Uh Oh! This page does not exist.</Typography>
        </Grid>
        <Grid>
            <Link variant="subtitle" component="button" onClick={() => navigate(`/`)}>
                Go Home
            </Link>
        </Grid>
    </Grid>
    )
}

export default Page404