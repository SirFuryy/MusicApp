import { getApi } from "./connectAPI.js";

let spotifyApi

async function getartisti() {
    try {
        spotifyApi = await getApi();

        const artisti = await spotifyApi.get;
        return generi.body.genres;
    } catch (error) {
        console.log(error);     
    }
}

export { getgenere };