import React from "react";
import PropTypes from 'prop-types'
import { IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close'

function CloseButton(props){
    return(
        <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={props.onClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    )
}

CloseButton.propTypes = {
    onClose: PropTypes.func.isRequired
}

export default CloseButton