import { ObjectId } from 'mongodb';
import { mongoClient } from "./connectMongo.js";
import { z } from 'zod';

const playlistSchema = z.object({
    creatore: z.string().length(24),
    pubblica: z.boolean(),
    tracce: z.array(z.string()),            //sistemare lunghezza tracce
    titolo: z.string().min(2),
    descrizione: z.string().min(2),
    tag: z.array(z.string().min(2)).nonempty(),
    durata: z.number().min(0)
}).partial().strict();

const idSchema = z.string().length(24);

//ritorna le playlist dell'utente
async function playlistUtente(id, token) {
    if (!idSchema.safeParse(id).success) {
        return ({status: 'error', code: 400, error: "id non valido"});
    }
    try{
    const db = mongoClient.db('TWM');
    const collection = db.collection('Utenti');
    try {
        let playlist = [];
        const playlistUtente = await collection.findOne({ "_id": new ObjectId(id) }, { projection: { _id: 1, token: 1, playlist: 1 } });
        if (playlistUtente === null) {
            return {status: 'error', code: 404, error: "utente non trovato"};
        }

        const collectionPlaylist = db.collection('Playlist');
        for (let i = 0; i < playlistUtente.playlist.length; i++) {
            await collectionPlaylist.findOne({"_id": new ObjectId(playlistUtente.playlist[i]), "pubblica": true})
            .then((result) => {
                if (result !== null) {
                    playlist.push(result);
                }
            });
        }
        if (playlistUtente.token === token) {
            for (let i = 0; i < playlistUtente.playlist.length; i++) {
                await collectionPlaylist.findOne({"_id": new ObjectId(playlistUtente.playlist[i]), "pubblica": false})
                .then((result) => {
                    if (result !== null) {
                        playlist.push(result);
                    }
                }); 
            }
        }
        
        if(playlist.length === 0){
            return {status: 'void', code: 200, value: "nessuna playlist trovata"};
        } else {
            return {status: 'ok', code:200, value: playlist};
        } 
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
    } catch (error) {
        console.log("errore nella connessione al db: " + error);
        return {status: 'error', code: 500, error: error};
    }
}

//ritorna delle playlist pubbliche, in base al limite richiesto, partendo dalla più recente
async function playlistPubbliche(limit) {
    try {
    const db = mongoClient.db('TWM');
    const collection = db.collection('Playlist');
    try {
        let playlist = [];
        await collection.find({ "pubblica": true })
                        .sort({"_id" : -1})
                        .limit(parseInt(limit)).toArray()
        .then((result) => {
            playlist = result;
        });

        if(playlist.length === 0){
            return {status: 'void', code: 200, value: "nessuna playlist pubblica trovata"};
        } else {
            return {status: 'ok', code:200, value: playlist};
        } 
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
    } catch (error) {
        console.log("errore nella connessione al db: " + error);
        return {status: 'error', code:500, error: error};
    }
}

//ritorna una playlist singola in base all'id
async function playlistSingola(id) {
        if (!idSchema.safeParse(id).success) {
            return {status: 'error', code: 400, error: "id non valido"};
        }
        try {
        const db = mongoClient.db('TWM');
        const collection = db.collection('Playlist');
        try {
            let result = await collection.findOne({ "_id": new ObjectId(id) })
            .then((result) => {
                if (result === null) {
                    return {status: 'error', code: 404, error: "Nessun utente torvato con questo id: "+id};
                } else {
                    return {status: 'ok', code: 200, value: result};
                }
            });
            return result;
        } catch (error) {
            console.log(error);
            return{status: 'error', code: 500, error: error};
        }
        } catch (error) {
            console.log("errore nella connessione al db: " + error);
            return{status: 'error', code: 500, error: error};
        }
}



//modifica i dati di una playlist
async function modificaPlaylist(id, data) {
    if (!idSchema.safeParse(id).success) {
        return{status: 'error', code: 400, error: "id non valido"};
    }

    if (!playlistSchema.safeParse(data).success) {
        return{status: 'error', code: 400, error: "dati non validi"};
    }

    try{
    const db = mongoClient.db('TWM');
    const collection = db.collection('Playlist');

    try {
        return await collection.updateOne({ "_id": new ObjectId(id) }, { $set: data })
        .then((result) => {
            if (result.modifiedCount === 1) {
                return{status: 'ok', code: 200, value: "playlist modificata"};
            } else {
                return{status: 'error', code: 404, error: "nessuna playlist modificata"};
            }
        });
    } catch (error) {
        console.log(error);
        return{status: 'error', code: 500, error: error};
    } 
    } catch (error) {
        console.log("errore nella connessione al db: " + error);
        return{status: 'error', code: 500, error: error};
    }
}

async function eliminaPlaylist(id) {
    if (!idSchema.safeParse(id).success) {
        return{status: 'error', code: 400, error: "id non valido"};
    }
    try{
    const db = mongoClient.db('TWM');
    const collection = db.collection('Playlist');
    try {
        return await collection.deleteOne({ "_id": new ObjectId(id) })
        .then((result) => {
            if (result.deletedCount === 1) {
                return{status: 'ok', code: 200, value: "playlist eliminata"};
            } else {
                return{status: 'error', code: 404, error: "nessuna playlist eliminata"};
            }
        });
    } catch (error) {
        console.log(error);
        return{status: 'error', code: 500, error: error};
    }
    } catch (error) {
        console.log("errore nella connessione al db: " + error);
        return{status: 'error', code: 500, error: error};
    }
}

async function creaPlaylist(idUtente, data) {
    if (!idSchema.safeParse(idUtente).success) {
        return{status: 'error', code: 400, error: "id non valido"};
    }
    if (!playlistSchema.safeParse(data).success) {
        return{status: 'error', code: 400, error: "dati non validi"};
    }
    try {
    const db = mongoClient.db('TWM');
    const collection = db.collection('Playlist');
    try {
        await collection.insertOne(data)
        .then((result) => {
            if (result.acknowledged) {
                try {
                    db.collection('Utenti').updateOne({ "_id": new ObjectId(idUtente) }, { $push: { playlist: result.insertedId.toString() } })
                    .then((result) => {
                        if (result.modifiedCount === 1) {
                            return{status: 'ok', code: 201, value: result};
                        } else {
                            return{status: 'error', code: 500, error: "errore nella creazione della playlist"};
                        }
                    });
                } catch (error) {
                    console.log(error);
                    return{status: 'error', code: 500, error: error};
                }
            } else {
                return{status: 'error', code: 500, error: "errore nella creazione della playlist"};
            }
        });
    } catch (error) {
        console.log(error);
        return{status: 'error', code: 500, error: error};
    }
    } catch (error) {
        console.log("errore nella connessione al db: " + error);
        return{status: 'error', code: 500, error: error};
    }
}

export { playlistUtente, playlistPubbliche, playlistSingola, modificaPlaylist, eliminaPlaylist, creaPlaylist };