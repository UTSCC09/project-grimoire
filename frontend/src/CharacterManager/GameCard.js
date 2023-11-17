import { Card, CardActionArea, CardActions, CardContent, Button, CardMedia, Typography, Box } from "@mui/material";
import React from "react";
import PropTypes from 'prop-types';

function GameCard(props){
    return (
        <Card sx={props.sx}>
            <CardActionArea sx={{height:"100%", display:'flex', justifyContent:'flex-start', flexDirection:'column'}}
                onClick={props.onClick}>
                <CardMedia
                component="img"
                sx={{width:'100%', objectFit:'fill', height:250}}
                image={`${process.env.REACT_APP_URL}/api/games/${props.gameId}/pic`}
                alt="Game Banner"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {props.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {props.description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

GameCard.propTypes = {
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
}

export default GameCard