import { ObjectId } from 'mongodb';
import { connectToCluster, mongoClient } from "./connectMongo.js";
import { record, z } from 'zod';

const utenteSchema = z.object({
    id: z.string().length(24),
    nomeUtente: z.string().min(2),
    password: z.string().min(8),
    email: z.string().email(),
    nome: z.string().min(2),
    cognome: z.string().min(2),
    sesso: z.enum(["M", "F", "Altro"]),
    dataNascita: z.date(),
    generi: z.array(z.string().min(2)).min(1),
    artistaPreferito: z.string().min(2),
    utentiSeguiti: z.array(z.string().length(24)),
    playlist: z.array(z.string().min(2))
}).partial().strict();

const idSchema = z.string().length(24);

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

async function modificaUtente(id, data) {
    if (!utenteSchema.safeParse(data).success) {
        return {status: 'error', code: 400, error: "dati non validi"};
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

async function modificaSeguiti(id, idFollow) {
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
            const params = { "_id": new ObjectId(id), "utentiSeguiti": new ObjectId(idFollow) };
            let result = await collection.findOne(params)
            .then(async (result) => {
                if (result === null) {
                    const params = { $push: 
                        { utentiSeguiti : new ObjectId(idFollow) } };
                    let result = await collection.updateOne({ "_id": new ObjectId(id) }, params)
                    .then((result) => {
                        if (result.modifiedCount === 0) {
                            console.log('Nessun utente modificato in push')
                            return {status: 'error', code: 404, error: "nessun utente modificato con id: " + id};
                        } else {
                            console.log('Utente modificato in push')
                            return {status: 'ok', code: 200, value: 'Utente modificato in push'};
                        }
                    });
                    return result;
                } else {
                    const params = { $pull: 
                        { utentiSeguiti: new ObjectId(idFollow) } };
                    await collection.updateOne({ "_id": new ObjectId(id) }, params)
                    .then((result) => {
                        if (result.modifiedCount === 0) {
                            console.log('Nessun utente modificato in pull')
                            return {status: 'error', code: 404, error: "nessun utente modificato con id: " + id};
                        } else {
                            console.log('Utente modificato in pull')
                            return {status: 'ok', code: 200, value: 'Utente modificato in pull'};
                        }
                    });
                    return result;
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

async function eliminaUtente(id) {
    if (!idSchema.safeParse(id).success) {
        return {status: 'error', code: 400, error: "id non valido"};
    }
    try {
        const db = mongoClient.db('TWM');
        const collection = db.collection('Utenti');
        try {
            return await collection.deleteOne({ "_id": new ObjectId(id) })
            .then((result) => {
                if (result.deletedCount === 0) {
                    return {status: 'error', code: 404, error: "nessun utente eliminato con id: " + id};
                } else {
                    return {status: 'ok', code: 200, value: "utente eliminato"};
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

async function modificaPassword(data) {
    const userDataSchema = z.object({
        passnuova: z.string().min(6),
        passvecchia: z.string().min(6),

    });
    
    try {
        const db = mongoClient.db("TWM");
        const collection = db.collection("Utenti");
    
    try {
        userDataSchema.parse(data);
        const user = await collection.findOne({"email_text": email});

        if(user.password===data.passvecchia){
            await collection.updateOne(
                { email_text: email }, // Filter
                { $set:{ password: data.passnuova} } // Update operation
            );
            return {status: 'ok', code: 200, value: 'password modificata in push'};
        }else{
            return {status: 'error', code: 404, error: "nessuna password modificata"};
        }

    } catch (error) {
        console.error(error);
        return {status: 'error', code: 500, error: error};
    } 
    }catch (error) {
        console.error(error);
        return {status: 'error', code: 500, error: error};
    }
}

export { utentiMisti, utenteSingolo, amiciUtente, modificaUtente, modificaSeguiti, eliminaUtente};