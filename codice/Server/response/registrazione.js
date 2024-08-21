import { connectToCluster } from "./connectMongo.js";
import bcrypt from 'bcryptjs';
import { z } from 'zod'; 

const registrazioneSchema = z.object({
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

async function registrazione(data) {
    userData.data= new Date(userData.data);

    if (!registrazioneSchema.safeParse(data).success) {
        return {status: 'error', code: 400, error: 'dati non validi'};
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
    const diffInYears = today.getFullYear() - birthDate.getFullYear();

    if (diffInYears < 14) {
        return {status: 'error', code: 400, error: 'Devi avere almeno 14 anni per registrarti'}; 
    }

    if (data.generi.length === 0) {
        return {status: 'error', code: 400, error: 'Seleziona almeno un genere'};
    }

    data.password = await bcrypt.hash(data.password, 10);

    try {
    const mongoClinet = await connectToCluster();
    const db = mongoClinet.db('TWM');
    const collection = db.collection('Utenti');
    try {
        const id = await collection.insertOne(data);
        return {status: 'ok', code: 201, value: id.insertedId};
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: 'Internal Server Error'};
    } finally {
        await closeMongo();
    }
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: 'Errore di connessione al database'};
    }
}

export {registrazione};