import { ObjectId } from 'mongodb';
import { connectToCluster, mongoClient } from "./connectMongo.js";
import { z } from 'zod';
import { getApi } from './connectAPI.js';

const idInput = z.string().min(1);

//ricerca normale
async function ricerca(input) {
    if (!idInput.safeParse(input).success) {
        return {status: 'error', code: 400, error: "input non valido"};
    }
    try {
        const db = mongoClient.db('TWM');
        var collection = db.collection('Utenti');
    try {
        let utenti = await collection.find({ $or: [{"nomeUtente": { $regex: `^${input}.*`, $options: 'i'}},
            {"nome": { $regex: `^${input}.*`, $options: 'i'}},
            {"cognome": { $regex: `^${input}.*`, $options: 'i'}}]
        }, { projection : {
            "_id": 1,
            "nomeUtente": 1,
            "nome": 1,
            "cognome": 1,
            "playlist": 1,
            "utentiSeguiti": 1
        }}).toArray();

        collection = db.collection('Playlist'); 
        let playlist = await collection.find({ $or: [ {"titolo": { $regex: `^${input}.*`, $options: 'i' }},
            {"tag": { $regex: `^${input}.*`, $options: 'i' }},
            {"autore": { $regex: `^${input}.*`, $options: 'i' }}], "pubblica": true
        }, {projection : {
            "_id": 1,
            "titolo": 1,
            "autore": 1,
            "tracce": 1,
            "tag": 1
        }}).toArray();

        collection = db.collection('Canzoni');
        let canzoni = await collection.find({ $or: [ {"Titolo": { $regex: `^${input}.*`, $options: 'i' }},
            {"Autore": { $regex: `^${input}.*`, $options: 'i' }},
            {"Genere": { $regex: `^${input}.*`, $options: 'i' }}]
        }).toArray();
        return {status: 'ok', code: 200, value: {utenti, playlist, canzoni}};
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
    } catch (error) {
        console.log("errore nella connessione al db: " + error);
        return {status: 'error', code: 500, error: error};
    };
}



//ricerca utilizzando anche spotify
async function ricercaConSpotify(input) {
    if (!idInput.safeParse(input).success) {
        return {status: 'error', code: 400, error: "input non valido"};
    }
    try {
        const db = mongoClient.db('TWM');
        var collection = db.collection('Utenti');
    try {
        let utenti = await collection.find({ $or: [{"nomeUtente": { $regex: `^${input}.*`, $options: 'i'}},
            {"nome": { $regex: `^${input}.*`, $options: 'i'}},
            {"cognome": { $regex: `^${input}.*`, $options: 'i'}}]
        }, { projection : {
            "_id": 1,
            "nomeUtente": 1,
            "nome": 1,
            "cognome": 1,
            "playlist": 1,
            "utentiSeguiti": 1
        }}).toArray();

        collection = db.collection('Playlist'); 
        let playlist = await collection.find({ $or: [ {"titolo": { $regex: `^${input}.*`, $options: 'i' }},
            {"tag": { $regex: `^${input}.*`, $options: 'i' }},
            {"autore": { $regex: `^${input}.*`, $options: 'i' }}], "pubblica": true
        }, {projection : {
            "_id": 1,
            "titolo": 1,
            "autore": 1,
            "tracce": 1,
            "tag": 1
        }}).toArray();
        
        let can = await ricercaCanzoniSpoty(input);
        if (can.status === 'error') {
            return {status: 'error', code: 404, error: "errore nella ricerca delle canzoni"};
        }
        let canzoni = can.value
        return {status: 'ok', code: 200, value: {utenti, playlist, canzoni}};
        
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
    } catch (error) {
        console.log("errore nella connessione al db: " + error);
        return {status: 'error', code: 500, error: error};
    };
}

async function ricercaCanzoniSpoty(input) {
    if (!idInput.safeParse(input).success) {
        return {status: 'error', code: 400, error: "input non valido"};
    }
    try {
        const db = mongoClient.db('TWM');
        var collection = db.collection('Canzoni');
    try {
        let canzoni = await collection.find({ $or: [ {"Titolo": { $regex: `^${input}.*`, $options: 'i' }},
            {"Autore": { $regex: `^${input}.*`, $options: 'i' }},
            {"Genere": { $regex: `^${input}.*`, $options: 'i' }}]
        }).toArray();
        if (canzoni.length < 4) {
            const api = await getApi();
            const response = await api.searchTracks(input, {
                    limit: 10
            })
            .then((response) => {
                let canzoniSpoty = response.body.tracks.items.map((item) => {
                    let artisti = [];
                    item.artists.forEach((artista) => {
                        artisti.push(artista.name);
                    });
                    return {
                        "Titolo": item.name,
                        "Autore": artisti,
                        "Durata": item.duration_ms,
                        "idSpotify": item.id
                    }
                });
                return canzoniSpoty;
            });
            salvaCanzoni(response);
            canzoni = canzoni.concat(response);
            return {status: 'ok', code: 200, value: canzoni};
        }
        return {status: 'ok', code: 200, value: canzoni};
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
    } catch (error) {
        console.log("errore nella connessione al db: " + error);
        return {status: 'error', code: 500, error: error};
    };
}

//salva le canzoni su spotify
async function salvaCanzoni(canzoni) {
    try {
        const db = mongoClient.db('TWM');
        var collection = db.collection('Canzoni');
        canzoni.forEach(async (canzone) => {
            await collection.updateOne({"idSpotify": canzone.idSpotify}, {$set: canzone}, {upsert: true});
        });
    } catch (error) {
        console.log("errore nella connessione al db: " + error);
    }
}

export { ricerca, ricercaConSpotify, ricercaCanzoniSpoty };