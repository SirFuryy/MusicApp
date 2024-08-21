import request from "request";
import SpotifyWebApi from "spotify-web-api-node";

async function gettoken() {
    const client_id = "9cf26cca78fd4646865819b9662aed85";
    const client_secret = "3ed0b703b7aa40d1b694e29f7f20ca28";

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        form: {
          grant_type: 'client_credentials'
        },
        json: true
    };
    
    return new Promise((resolve, reject) => {
        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                resolve(body.access_token);
            } else {
                reject(error);
            }
        });
    });

}

async function getApi() {
    var access_token = await gettoken();
    var spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(access_token);
    return spotifyApi;
}

export {getApi};