import {Client} from "@googlemaps/google-maps-services-js";
import dotenv from 'dotenv'
const client = new Client({})
dotenv.config()

const API_KEY = process.env.GOOGLE_MAPS_API_KEY
//radius in m
const DEFAULTGAMERADIUS = 5000
export function getLocalGames(lat, lng, radius=DEFAULTGAMERADIUS){
    return client.textSearch(
        {params: {
            location: [lat, lng],
            radius: radius,
            query: "Tabletop game stores",
            key: API_KEY
        }}
    )
}

export function testGeocode(){
    console.log('api key', API_KEY)
    const args = {
        params: {
            key: API_KEY,
            address: 'Perth 4WD & Commercial Centre',
        }
    };
    return client.geocode(args)
}