import { Card, CardActionArea, CardActions, CardContent, Button, CardMedia, Typography, Box } from "@mui/material";
import React, { useState } from "react";
import PropTypes from 'prop-types';

function GameCard(props){
    const [hover, setHover] = useState(false) 

    return (
        <Card sx={props.sx}>
            <CardActionArea sx={{height:"100%", display:'flex', justifyContent:'flex-start', flexDirection:'column'}}
                onClick={(e) => {if(!props.deployed) return props.onClick(e)}}
                onMouseOver={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                <CardMedia
                component="img"
                sx={{width:'100%', objectFit:'fill', height:250}}
                image={`${process.env.REACT_APP_URL}/api/games/${props._id}/pic`}
                alt="Game Banner"
                />
                <CardContent>
                    {
                        hover && !props.deployed? 
                        <Typography gutterBottom variant="h5" component="div">
                            Coming Soon!
                        </Typography>
                        :
                        <>
                            <Typography gutterBottom variant="h5" component="div">
                                {props.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {props.description}
                            </Typography>
                        </>
                    }
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