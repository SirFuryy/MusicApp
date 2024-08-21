const express = require('express')
const app = express()
const {persone} = require('./persone');

app.use(express.static('./public'));    //per inviare pagine html pronte
const path = __dirname + "/public";


app.get('/', (req, res) => {
    res.sendFile("homepage.html", {root: path});
});

app.get('/persone', (req, res) => {
    res.json(persone);
});

//mapping per selezionare solo alcuni campi del json
app.get('/persone/accorciate', (req, res) => {
    const personeAccorciate = persone.map((pers) => {
        return {
            "id": pers.id,
            "nome": pers.nome,
            "cognome": pers.cognome
        };
    });
    res.json(personeAccorciate);
});

//cerco attraverso le query un risultato, lo metto prima dell'uso dei parametri :id per evitare conflitti. Esempio http://localhost:3000/persone/search?pippo=M
app.get('/persone/search', (req, res) => {
    const {pippo, limit} = req.query;       //recupero i parametri query e limit dalla richiesta
    let personeFiltrate = persone;      //IMPORTANTE IL NOME USATO COME QUERY (AD ESEMPIO PIPPO)

    if(pippo) {
        personeFiltrate = personeFiltrate.filter((pers) => { //IMPORTANTE ANCHE IL CASE SENSITIVE
            return pers.nome.startsWith(pippo) || pers.cognome.startsWith(pippo);
        });
    }

    if (limit) {                //in questo modo posso eseguire la paginazione dei valori
        personeFiltrate = personeFiltrate.slice(0, limit); //se ho un limite lo applico al risultato
    }           //eseguo una slice per il valore posto come limite

    if (personeFiltrate.length === 0) {     //se non trovo nessun risultato invio un errore 404
        return res.status(200).json({succes: false, true: "Nessun risultato trovato"});
    }

    res.json(personeFiltrate);
});


//così invece vado a selezionare solo una determinata persona in base all'id
app.get('/persone/:id', (req, res) => {
    const id = req.params.id;       //attraverso :id prendo il parametro dopo lo / e lo recupero attraverso req.params.id
    const pers = persone.find((persona)=> persona.id === id); //importante controllare il tipo usato per id (normalmente dovrebbe essre stringa, ma può variare)

    if(!pers) {     //se non trovo la persona inviuo un errore 404
        return res.status(404).send("<h1>Prodotto non trovato</h1>");
    }

    res.json(pers);
});



app.all('*', (req, res) => {       
    res.sendFile("error.html", {root: path});
});

const port = 3000;
app.listen(port);