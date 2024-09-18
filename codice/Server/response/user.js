import { Collection, ObjectId } from 'mongodb';
import { connectToCluster, mongoClient } from "./connectMongo.js";
import { record, z } from 'zod';
import bcrypt from 'bcryptjs';

const utenteSchema = z.object({
    id: z.string().length(24),
    nomeUtente: z.string().min(2),
    nome: z.string().min(2),
    cognome: z.string().min(2),
    sesso: z.enum(["M", "F"]),
    dataNascita: z.string().min(10).max(10),
    generi: z.array(z.string().min(2)).min(1),
    artistaPreferito: z.string().min(2),
}).partial().strict();

const idSchema = z.string().length(24);

//ritorna una lista di utenti misti
async function utentiMisti(limit) {
    try {
    const db = mongoClient.db('TWM');
    const collection = db.collection('Utenti');
    try {
        let utenti = [];
        await collection.find({}, {projection: {
            _id: 1,
            nomeUtente: 1,
            playlist: 1,
            generi: 1,
            artistaPreferito: 1,
            utentiSeguiti: 1
        }}).limit(parseInt(limit)).toArray()
        .then((result) => {
            utenti = result;
        });

        if(utenti.length === 0){
            return {status: 'void', code: 200, value: "nessun utente trovato"};
        } else {
            return {status: 'ok', code: 200, value: utenti};
        } 
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    } 
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
}

//ritorna un utente in base all'id
async function utenteSingolo(id, tokenRichiedente) {
    if (!idSchema.safeParse(id).success) {
        return ({status: 'error', code: 400, error: "id non valido"});
    }
    try {
        const db = mongoClient.db('TWM');
        const collection = db.collection('Utenti');
        try {
            let result = await collection.findOne({ "_id": new ObjectId(id) })
            .then((result) => {
                if (result === null) {
                    return {status: 'error', code: 404, error: "Nessun utente trovato con questo id: " + id};
                } else {
                    if (result.token === tokenRichiedente) {
                        return {status: 'ok', code: 200, value: result};
                    } else {
                        let r = {
                            _id: result._id,
                            nomeUtente: result.nomeUtente,
                            playlist: result.playlist,
                            generi: result.generi,
                            artistaPreferito: result.artistaPreferito,
                            utentiSeguiti: result.utentiSeguiti
                        }
                        return {status: 'ok', code: 200, value: r};
                    }
                }
            });
            return result;
        } catch (error) {
            console.log(error);
            return {status: 'error', code: 500, error: error};
        }
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
}

//ritorna gli amici di un utente in base all'id
async function amiciUtente(id) {
    if (!idSchema.safeParse(id).success) {
        return ({status: 'error', code: 400, error: "id non valido"});
    }
    try {
    const db = mongoClient.db('TWM');
    const collection = db.collection('Utenti');
    try {
        //trovo l'utente
        let utente = await collection.findOne({ "_id": new ObjectId(id) });
        if (utente === null) {
            return {status: 'error', code:404, error: "Nessun utente trovato con questo id: " + id};
        }
        
        //cerco gli amici iterando su tutti gli id degli utenti seguiti
        let amici = [];
        for (let i = 0; i < utente.utentiSeguiti.length; i++) {
            await collection.findOne({ "_id": new ObjectId(utente.utentiSeguiti[i]) }, {projection: {
                _id: 1,
                nomeUtente: 1,
                playlist: 1,
                generi: 1,
                artistaPreferito: 1,
                utentiSeguiti: 1
            }})
            .then((result) => {
                amici.push(result);
            });
        }
        if(amici.length === 0){
            return {status: 'void', code: 200, value: "nessun amico trovato"};
        } else {
            return {status: 'ok', code: 200, value: amici};
        } 
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }

}

//modifica un utente, necessita di id, data e token
async function modificaUtente(id, data, token) {
    if (!utenteSchema.safeParse(data).success) {
        return {status: 'error', code: 400, error: "dati non validi " + utenteSchema.safeParse(data).error};
    }

    if (!idSchema.safeParse(id).success) {
        return {status: 'error', code: 400, error: "id non valido"};
    }

    try {
        const db = mongoClient.db('TWM');
        const collection = db.collection('Utenti');
        try {
            const updateDocument = {
                $set: data
            }
            let prop = await collection.findOne({ "_id": new ObjectId(id) }, {projection: {token: 1}})
            .then((result) => {
                if (result.token === token) {
                    return true;
                } else {
                    return false;
                }
            });
            if (!prop) {
                return {status: 'error', code: 403, error: "Non sei autorizzato a modificare questo utente"};
            }
            return await collection.updateOne({ "_id": new ObjectId(id) }, updateDocument)
            .then((result) => {
                if (result.modifiedCount === 0) {
                    return {status: 'error', code: 404, error: "nessun utente modificato con id: "+ id};
                } else {
                    return {status: 'ok', code: 200, value: "utente modificato"};
                }
            });
        } catch (error) {
            console.log(error);
            return {status: 'error', code: 500, error: error};
        }
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
}

async function modificaElencoPlaylist(id, playlistid, token) {
    if (!idSchema.safeParse(id).success) {
        return {status: 'error', code: 400, error: "id utente non valido"};
    }

    if (!idSchema.safeParse(playlistid).success) {
        return {status: 'error', code: 400, error: "id playlist non valido"};
    }

    try {
        const db = mongoClient.db('TWM');
        const collection = db.collection('Utenti');
    try {
        return await collection.findOne({ "_id": new ObjectId(id) }, {projection: {token: 1, playlist: 1}})
        .then((result) => {
            if (result === null) {
                return {status: 'error', code: 404, error: "Nessun utente trovato con questo id: " + id};
            } else if (result.token !== token) {
                return {status: 'error', code: 403, error: "Non sei autorizzato a modificare questo utente"};
            } else {
                let find = false;
                for (let i = 0; i < result.playlist.length; i++) {
                    if (result.playlist[i] == playlistid) {
                        find = true;
                        break;
                    }
                }
                if (!find) {
                    const params = { $push: 
                        { playlist : new ObjectId(playlistid) } };
                    return collection.updateOne({ "_id": new ObjectId(id) }, params)
                    .then((result) => {
                        if (result.modifiedCount === 0) {
                            return {status: 'error', code: 404, error: "nessuna playlist aggiunta con id: " + playlistid};
                        } else {
                            return {status: 'ok', code: 200, value: 'playlist aggiunta'};
                        }
                    });
                } else {
                    for (let i = 0; i < result.playlist.length; i++) {
                        if (result.playlist[i] == playlistid) {
                            result.playlist.splice(i, 1);
                            break;
                        }
                    }
                    
                    return collection.updateOne({ "_id": new ObjectId(id) }, { $set: { playlist: result.playlist } })
                    .then((result) => {
                        if (result.modifiedCount === 0) {
                            return {status: 'error', code: 404, error: "nessuna playlist rimossa con id: " + playlistid};
                        } else {
                            return {status: 'ok', code: 200, value: 'playlist rimossa'};
                        }
                    });
                }
            }
        });
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }

}
//modifica gli utenti seguiti, necessita di id, idFollow e token
async function modificaSeguiti(id, idFollow, token) {
    if (!idSchema.safeParse(id).success) {
        return {status: 'error', code: 400, error: "id utente non valido"};
    }

    if (!idSchema.safeParse(idFollow).success) {
        return {status: 'error', code: 400, error: "id utente da seguire non valido " + idSchema.safeParse(idFollow).error};
    }

    try {
        const db = mongoClient.db('TWM');
        const collection = db.collection('Utenti');
        try {
            return await collection.findOne({"_id": new ObjectId(id)}, {projection: {token: 1, utentiSeguiti: 1}})
            .then(async (result) => {
                if (result === null) {
                    return {status: 'error', code: 404, error: "Nessun utente trovato con questo id: " + id};
                }
                if (result.token !== token) {
                    return {status: 'error', code: 403, error: "Non sei autorizzato a modificare questo utente"};
                }
                let find = false;
                for (let i = 0; i < result.utentiSeguiti.length; i++) {
                    if (result.utentiSeguiti[i] == idFollow) {
                        find = true;
                        break;
                    }
                }
                if (!find) {
                    const params = { $push: 
                        { utentiSeguiti : new ObjectId(idFollow) } };
                    return await collection.updateOne({ "_id": new ObjectId(id) }, params)
                    .then((result) => {
                        if (result.modifiedCount === 0) {
                            console.log('Nessun utente modificato in push')
                            return {status: 'error', code: 404, error: "nessun utente aggiunto con id: " + idFollow};
                        } else {
                            console.log('Utente modificato in push')
                            return {status: 'ok', code: 200, value: 'Utente modificato in push'};
                        }
                    });
                } else {
                    for (let i = 0; i < result.utentiSeguiti.length; i++) {
                        if (result.utentiSeguiti[i] == idFollow) {
                            result.utentiSeguiti.splice(i, 1);
                            break;
                        }
                    }
                    
                    return await collection.updateOne({ "_id": new ObjectId(id) }, { $set: { utentiSeguiti: result.utentiSeguiti } })
                    .then((result) => {
                        if (result.modifiedCount === 0) {
                            console.log('Nessun utente modificato in pull')
                            return {status: 'error', code: 404, error: "nessun utente rimosso con id: " + idFollow};
                        } else {
                            console.log('Utente modificato in pull')
                            return {status: 'ok', code: 200, value: 'Utente modificato in pull'};
                        }
                    });
                }
            });
        } catch (error) {
            console.log(error);
            return {status: 'error', code: 500, error: error};
        }
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
}

//elimina un utente, necessita di id, token e password
async function eliminaUtente(id, token, password) {
    const passSchema = z.string().min(8);

    if (!idSchema.safeParse(id).success) {
        return {status: 'error', code: 400, error: "id non valido"};
    }

    if (!passSchema.safeParse(password).success) {
        return {status: 'error', code: 400, error: "password non valida"};
    }

    try {
        const db = mongoClient.db('TWM');
        var collection = db.collection('Utenti');
        try {
            var usr = await collection.findOne({ "_id": new ObjectId(id), "token": token }, {projection: {password: 1, playlist: 1}}) 
            if (usr === null) {
                return {status: 'error', code: 404, error: "Nessun utente trovato con questo id: " + id};
            }

            if (usr.password !== password) {
                return {status: 'error', code: 404, error: "Password non corretta"};
            }
                
            var elmUt = await collection.deleteOne({ "_id": new ObjectId(id) })
                
            if (elmUt.deletedCount === 0) {
                return {status: 'error', code: 404, error: "nessun utente eliminato con id: " + id};
            }

            collection = db.collection('Playlist');
            let pl = await collection.find({"creatore": new ObjectId(id)}, {projection: {id: 1}}).toArray();

            for (let i = 0; i < pl.length; i++) {
                let d = await collection.deleteOne({ "_id": new ObjectId(pl[i]._id) });

                if (d.deletedCount === 0) {
                    return {status: 'error', code: 404, error: "utente eliminato ma nessuna playlist eliminata con id: " + pl[i]._id};
                }
            }

            collection = db.collection('Utenti');
            await collection.updateMany({}, { $pull: { utentiSeguiti: new ObjectId(id) } })
            await collection.updateMany({}, { $pull: { playlist: { $in: pl.map(p => new ObjectId(p._id)) } } });
            return {status: 'ok', code: 200, value: "utente eliminato con successo da tutte le parti"};
            
        } catch (error) {
            console.log(error);
            return {status: 'error', code: 500, error: error};
        }
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: error};
    }
}

//modifica la password, necessita di password vecchia, nuova e token
async function modificaPassword(data, token) {
    const userDataSchema = z.object({
        id: z.string().length(24),
        passvecchia: z.string().min(8),
        passnuova: z.string().min(8)
    }).partial().strict();

    const id = data.id;

    if (!idSchema.safeParse(id).success) {
        return {status: 'error', code: 400, error: "id non valido"};
    }

    if (!userDataSchema.safeParse(data).success) {
        return {status: 'error', code: 400, error: "dati non validi " + userDataSchema.safeParse(data).error};
    }
    
    try {
        const db = mongoClient.db("TWM");
        const collection = db.collection("Utenti");
    
    try {
        const user = await collection.findOne({"_id": new ObjectId(id)}, {projection: {password: 1, token: 1}});
        console.log(user);
        if (!user) {
            return {status: 'error', code: 404, error: "Nessun utente trovato con questo id: " + id};
        }
        if (user.token !== token) {
            return {status: 'error', code: 403, error: "Non sei autorizzato a modificare questo utente"};
        }
        //user && bcrypt.compareSync(data.password, user.password)
        if(!bcrypt.compareSync(data.passvecchia, user.password)){
            return {status: 'error', code: 404, error: "Le password non coincidono"};
        }

        return await collection.updateOne(
            { "_id": new ObjectId(id) }, // Filter
            { $set:{ password: data.passnuova} } // Update operation
        ).then((result) => {
            if (result.modifiedCount === 0) {
                return {status: 'error', code: 404, error: "nessun utente modificato con id: " + id};
            } else {
                return {status: 'ok', code: 200, value: 'password modificata'};
            }
        });

    } catch (error) {
        console.error(error);
        return {status: 'error', code: 500, error: error};
    } 
    }catch (error) {
        console.error(error);
        return {status: 'error', code: 500, error: error};
    }
}

export { utentiMisti, utenteSingolo, amiciUtente, modificaUtente, modificaSeguiti, eliminaUtente, modificaPassword, modificaElencoPlaylist};