import { MongoClient } from "mongodb";
var mongoClient = await connectToCluster();
console.log("mongoclient: ");
console.log(mongoClient);

async function connectToCluster() {
    try {
        let mongoClient = new MongoClient("mongodb+srv://SirFuryy:dY1MAUlJeqnvE2SD@twm-musicapp.waebfrt.mongodb.net/?retryWrites=true&w=majority");
        await mongoClient.connect();
        console.log('Connessione al database avvenuta con successo');
        return mongoClient;
    } catch (error) {
        throw new Error (error);
    }
}

export {connectToCluster, mongoClient};
