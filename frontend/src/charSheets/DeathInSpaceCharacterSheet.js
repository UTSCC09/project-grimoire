import { Grid, ThemeProvider, Typography, createTheme } from "@mui/material"

const theme = createTheme({

})


function DeathInSpaceCharacterSheet (props)
{
    return <ThemeProvider theme={theme}>
    <Grid marginTop={'5%'} backgroundColor={'#ffffff'} height={'75%'} width={'80%'}>
        <Typography fontSize={'1.2rem'} >PP</Typography>
    </Grid>
    </ThemeProvider>
}



export default DeathInSpaceCharacterSheet