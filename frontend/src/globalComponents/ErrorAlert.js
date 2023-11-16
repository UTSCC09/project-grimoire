import { Alert, Snackbar } from "@mui/material";
import React from "react";
import PropTypes from 'prop-types'
import CloseButton from "./CloseButton";

function ErrorAlert(props){
    return(
        <Snackbar open={Boolean(props.error)}>
            <Alert severity="error" action={<CloseButton onClose={props.onClose}/>}>{props.error}</Alert>
        </Snackbar>
    )
}

ErrorAlert.propTypes={
    error: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
}

ErrorAlert.defaultProps={
    error: ""
}

export default ErrorAlert