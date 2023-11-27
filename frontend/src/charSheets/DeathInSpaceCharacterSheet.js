import { Grid, ThemeProvider, Typography, createTheme } from "@mui/material"
import { useEffect } from "react"
import './DeathInSpaceCharacterSheet.css'
import DISStatsContainer from './CharacterSheetMedia/DISStatsContainer.png'

const theme = createTheme({
    components:
        {
            MuiGrid:
            {
                styleOverrides:
                {
                    root:
                    {
                        backgroundColor: '#f5f6f7'
                    }
                }
            }
        }
})


function DeathInSpaceCharacterSheet (props)
{
    return <ThemeProvider theme={theme}>
    <Grid marginTop={'5%'} backgroundColor={'#f5f6f7'} height={'80%'} width={'80%'} container flexDirection={'row'}>
        <LeftSideOfSheet characterInfo={props.stats}/>
        <RightSideOfSheet characterInfo={props.stats}/>
    </Grid>
    </ThemeProvider>
}

function LeftSideOfSheet(props)
{
    return <Grid container flexDirection={'column'} borderRight={3} borderColor={'#000000'} width={'65%'}>
        <Typography borderColor={'#000000'} borderBottom={6} textAlign={'center'} width={'100%'} height={'10%'} fontSize={'2rem'}>Death In Space</Typography>
        <BelowTitleContent/>
        <CharacterStats/>
    </Grid>
}

function BelowTitleContent(props)
{
    return <Grid container height={'89%'} flexDirection={'row'}>
        <Stats/>
        <GeneralCharacterInfo/>
    </Grid>
}

function Stats(props)
{
    return <Grid justifySelf={'flex-end'} borderColor={'#000000'} height={'100%'} borderRight={5} width={'15%'} flexDirection={'column'}>
        <div className="statsContainer">
            <img alt="statsContainer" src={DISStatsContainer} className="statsImage"/>
            <Typography color={'#ffffff'}>pp</Typography>
        </div>
        <div className="statsContainer">
            <img alt="statsContainer" src={DISStatsContainer} className="statsImage"/>
        </div>
        <div className="statsContainer">
            <img alt="statsContainer" src={DISStatsContainer} className="statsImage"/>
        </div>
        <div className="statsContainer">
            <img alt="statsContainer" src={DISStatsContainer} className="statsImage"/>
        </div>
    </Grid>
}

function GeneralCharacterInfo(props)
{
    return <Grid container flexDirection={'row'} width={'85%'}>
        <CharacterNameAndPic/>
        
    </Grid>
}

function CharacterNameAndPic(props)
{
    return <Grid height={'25%'} width={'100%'} borderColor={'#000000'} borderBottom={5}>
        <div className="characterImageContainer"></div>
    </Grid>
}



function CharacterStats(props)
{
    return <Grid width={'10%'}>

    </Grid>
}

function RightSideOfSheet(props)
{
 return <Grid width={'35%'}>

 </Grid>
}



export default DeathInSpaceCharacterSheet