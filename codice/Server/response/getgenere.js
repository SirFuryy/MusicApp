import { getApi } from "./connectAPI.js";

let spotifyApi

async function getgenere() {
    try {
        spotifyApi = await getApi();

        const generi = await spotifyApi.getAvailableGenreSeeds();

        return generi.body.genres;
    } catch (error) {
        console.log(error);     
    }
}

export { getgenere };