import { Box, Grid, Link, Typography } from "@mui/material";
import React from "react";
import "./styling/general.css"
import { useNavigate } from "react-router";

function Credits(props){
    const linkSx={marginLeft:'1%'}
    const navigate = useNavigate()

    return (
    <Grid item container xs={12} className="full-center">
        <Grid item xs={12} >
            <Typography variant="h3" align="center">Credits for Grimoire</Typography>
            <Grid item xs={12}>
                <Grid item container xs={12}>
                    <Grid item>
                        <Typography>For useful labs, assignments, and code snippets, credit goes to</Typography>
                    </Grid>
                    <Grid item sx={linkSx}>
                        <Link href="https://thierrysans.me/">Thierry Sans</Link>
                    </Grid>
                </Grid>
                <Grid item container xs={12}>
                    <Typography>General credit goes to</Typography>
                    <Grid item sx={linkSx}>    
                        <Link href="https://stackoverflow.com/">Stack Overflow</Link>
                    </Grid>
                </Grid>
                <Grid item container xs={12}>
                    <Grid item>
                        <Typography>And General Credit To</Typography>
                    </Grid>
                    <Grid item sx={linkSx}>
                        <Link href="https://chat.openai.com/">Chat GPT</Link>
                    </Grid>
                </Grid>
                <Grid item container xs={12}>
                    <Typography>Images and Logo generated by</Typography>
                    <Grid item sx={linkSx}>
                        <Link href="https://www.midjourney.com/home?callbackUrl=%2Fexplore">Midjournery AI</Link>
                    </Grid>
                </Grid>
                <Grid item container xs={12}>
                    <Typography>For their wonderful example code, credit goes to</Typography>
                    <Grid item sx={linkSx}>
                        <Link href="https://docs.aws.amazon.com/">Amazon AWS</Link>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
        <Grid>
            <Link variant="subtitle" component="button" onClick={() => navigate(`/`)}>
                Go Home
            </Link>
        </Grid>
    </Grid>
    )
}

export default Credits