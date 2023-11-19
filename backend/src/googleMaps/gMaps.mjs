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

//make sure to look at documentation for allowed result_types
//https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding
//https://googlemaps.github.io/google-maps-services-js/enums/PlaceType2.html
export function reverseGeocode(lat, lng, result_types){
    if(!result_types)
        result_types = ['country', 'administrative_area_level_1',
    "administrative_area_level_2", "locality"]
    //     result_types = ['country', 'administrative_area_level_1', 
    // 'administrative_area_level_2 ', 'sublocality']
    return client.reverseGeocode({
        params:{
            latlng: [lat, lng],
            result_type: result_types,
            key: API_KEY
        }
    })
}

//function that formats geoocde response to be more useful
//reference documentation for types
export function formatReverseGeocode(geocodeResults, preferredIndex=0){
    if(geocodeResults.length <= preferredIndex)
        return {}
    let geocodeObj = geocodeResults[preferredIndex]
    
    const components = geocodeObj.address_components
    if(!components)
        return {}
    let formattedObj = {}
    for(let comp of components){
        let newObj = {
            short_name: comp.short_name,
            long_name: comp.long_name
        }
        let filtered = comp.types.filter((t) => t != 'political')
        let key = filtered.length > 0 ? filtered[0] : 'political'
        formattedObj[key] = newObj
    }

    geocodeObj.address_components = formattedObj
    return geocodeObj
}

// export function testGeocode(){
//     console.log('api key', API_KEY)
//     const args = {
//         params: {
//             key: API_KEY,
//             address: 'Perth 4WD & Commercial Centre',
//         }
//     };
//     return client.geocode(args)
// }