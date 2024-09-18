import { mongoClient } from "./connectMongo.js";
import bcrypt from 'bcryptjs';
import { Code } from "mongodb";
import { z } from "zod";

const schemaLogin = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

async function login(data) {
    if (!schemaLogin.safeParse(data)) {
        return {status: 'error', code: 400, error: 'Bad request'};
    }

    if (data.email === '') {
        return {status: 'error', code: 400, error: "l'email non può essere vuota"};
    }
    try {
    const db = mongoClient.db('TWM');
    const collection = db.collection('Utenti');
    try {
        const user = await collection.findOne({"email_text":data.email});
        if(user && bcrypt.compareSync(data.password, user.password)) {
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            console.log("creo "+token);
            const usr = {email: user.email_text, _id: user._id, nomeUtente: user.nomeUtente, utentiSeguiti: user.utentiSeguiti, playlist: user.playlist, sesso: user.sesso, token: token};
            try {
                await collection.updateOne({"email_text":data.email}, {$set: {"token": token}})
                .then((result) => {
                    if(result.matchedCount === 1) {
                        return {status: 'ok', code: 200, value: usr};
                    } else {
                        return {status: 'error', code: 500, error: "Errore interno nell' aggiornamento del token"};
                    }
                });

            } catch (error) {
                console.log(error);
                return {status: 'error', code: 500, error: 'Errore interno'};
            }
        return {status: 'ok', code: 200, value: usr};
        } else {
            return {status: 'error', code: 401, error: 'Login errato'};
        }      
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: 'Errore interno'};
    }
    } catch (error) {
        console.log(error);
        return {status: 'error', code: 500, error: 'Errore interno'};
    }
}

export { login };