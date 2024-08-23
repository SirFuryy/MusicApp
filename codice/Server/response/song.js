import { ObjectId } from 'mongodb';
import { connectToCluster, mongoClient } from "./connectMongo.js";
import { z } from 'zod';
import { getApi } from './connectAPI.js';

const idSchema = z.string().length(24);

//ritorna le informazioni di una canzone da spotify
async function canzoneSingola(idCanzone) {
    try {
        const spotifyApi = await getApi();
        let result = await spotifyApi.getTrack(idCanzone);
        return {status: 'ok', code: 200, value: result};      
    } catch (error) {
        return {status: 'error', code: 500, error: error};
    };
}

//rtorna le informazioni di più canzoni da spotify
async function canzoniMultiple(idCanzoni) {
    try {
        const spotifyApi = await getApi();
        let result = await spotifyApi.getTracks(idCanzoni);
        return {status: 'ok', code: 200, value: result};      
    } catch (error) {
        return {status: 'error', code: 500, error: error};
    };
}

//ritorna le informazioni di una canzone dal database
async function canzoneSingolaDB(idCanzone) {
    if (!idSchema.safeParse(idCanzone).success) {
        return {status: 'error', code: 400, error: "id non valido"};
    }
    try {
        const db = mongoClient.db('TWM');
        const collection = db.collection('Canzoni');
        try {
            let result = await collection.findOne({ "_id": new ObjectId(idCanzone) });
            return {status: 'ok', code: 200, value: result};
        } catch (error) {
            console.log(error);
            return {status: 'error', code: 500, error: error};
        }
    } catch (error) {
        console.log("errore nella connessione al db: " + error);
        return {status: 'error', code: 500, error: error};
    };
}

//ritorna le informazioni di più canzoni dal database
async function canzoniMultipleDB(idCanzoni) {
    for (let i = 0; i < idCanzoni.length; i++) {
        if (!idSchema.safeParse(idCanzoni[i]).success) {
            return {status: 'error', code: 400, error: "id non valido, "+id};
        }
    }
    try {
        const db = mongoClient.db('TWM');
        const collection = db.collection('Canzoni');
        try {
            let result = await collection.find({ "_id": { $in: idCanzoni.map(id => new ObjectId(id)) } }).toArray();
            return {status: 'ok', code: 200, value: result};
        } catch (error) {
            console.log(error);
            return {status: 'error', code: 500, error: error};
        }
    } catch (error) {
        console.log("errore nella connessione al db: " + error);
        return {status: 'error', code: 500, error: error};
    };
}

//aggiunge/toglie una canzone da una determinata playlist
async function modificaCanzonePlaylist(idPlaylist, idCanzone) {
    if (!idSchema.safeParse(idPlaylist).success) {
        return {status: 'error', code: 400, error: "id non valido"};
    }
    try {
    const db = mongoClient.db('TWM');
    const collection = db.collection('Playlist');
    try {
        const params = { "_id": new ObjectId(idPlaylist), "tracce": idCanzone };
        let risposta = await collection.findOne(params)
        .then(async (result) => {
            if (result === null) {
                const params = { $push: 
                    { tracce : idCanzone } };
                let risposta = await collection.updateOne({ "_id": new ObjectId(idPlaylist) }, params)
                .then((result) => {
                    if (result.modifiedCount === 0) {
                        return {status: 'error', code: 404, error: "nessuna canzone inserita in " + idPlaylist};
                    } else {
                        return {status: 'ok', code: 200, value: 'canzone inserita'};
                    }
                });
                return risposta;
            } else {
                const params = { $pull: 
                    { tracce: idCanzone } };
                let risposta = await collection.updateOne({ "_id": new ObjectId(idPlaylist) }, params)
                .then((result) => {
                    if (result.modifiedCount === 0) {
                        return{status: 'error', code: 404, error: "nessuna canzone eliminata da " + idPlaylist};
                    } else {
                        return {status: 'ok', code:200, value: 'Canzone eliminata'};
                    }
                });
                return risposta;
            }
        });
        return risposta;
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
    } catch (error) {
        console.log("errore nella connessione al db: " + error);
        return {status: 'error', code: 500, error: error};
    };
}

export { canzoneSingola, canzoniMultiple, modificaCanzonePlaylist, canzoneSingolaDB, canzoniMultipleDB };