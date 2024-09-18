import { connectToCluster, mongoClient } from "./connectMongo.js";
import bcrypt from 'bcryptjs';
import { z } from 'zod'; 

const registrazioneSchema = z.object({
    id: z.string().length(24),
    nomeUtente: z.string().min(2),
    password: z.string().min(8),
    email: z.string().email(),
    nome: z.string().min(2),
    cognome: z.string().min(2),
    sesso: z.enum(["M", "F"]),
    dataNascita: z.date(),
    generi: z.array(z.string().min(2)).min(1),
    artistaPreferito: z.string().min(2),
    utentiSeguiti: z.array(z.string().length(24)),
    playlist: z.array(z.string().min(2))
}).partial().strict();

async function registrazione(data) {
    data.dataNascita = new Date(data.dataNascita);
    if (!registrazioneSchema.safeParse(data).success) {
        return {status: 'error', code: 400, error: 'dati non validi '+registrazioneSchema.safeParse(data).error};
    }

    if (data.nomeUtente.length < 2) {
        return {status: 'error', code: 400, error: 'nome utente troppo corto'};
    }

    if (data.nome.length < 2) {
        return {status: 'error', code: 400, error: 'nome troppo corto'};
    }

    if (data.cognome.length < 2) {
        return {status: 'error', code: 400, error: 'cognome troppo corto'};
    }

    if (data.email.length < 2) {
        return {status: 'error', code: 400, error: 'email troppo corta'};
    }

    if (data.password.length < 8) {
        return {status: 'error', code: 400, error: 'password troppo corta'};
    }

    const today = new Date();
    const diffInYears = today.getFullYear() - data.dataNascita.getFullYear();

    if (diffInYears < 14) {
        return {status: 'error', code: 400, error: 'Devi avere almeno 14 anni per registrarti'}; 
    }

    if (data.generi.length === 0) {
        return {status: 'error', code: 400, error: 'Seleziona almeno un genere'};
    }

    data.password = await bcrypt.hash(data.password, 10);
    data.dataNascita = data.dataNascita.toISOString().split('T')[0];

    let dataToInsert = {
        _id: data.id,
        nomeUtente: data.nomeUtente,
        password: data.password,
        email_text: data.email,
        nome: data.nome,
        cognome: data.cognome,
        sesso: data.sesso,
        dataNascita: data.dataNascita,
        generi: data.generi,
        artistaPreferito: data.artistaPreferito,
        utentiSeguiti: data.utentiSeguiti,
        playlist: data.playlist
    };

    try {
    const db = mongoClient.db('TWM');
    const collection = db.collection('Utenti');
    try {
        const id = await collection.insertOne(dataToInsert);
        return {status: 'ok', code: 201, value: id.insertedId};
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return {status: 'error', code: 409, error: 'email già registrata'};
        }
        return {status: 'error', code: 500, error: 'Internal Server Error'};
    }
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: 'Errore di connessione al database'};
    }
}

export {registrazione};