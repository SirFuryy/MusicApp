const express = require('express')
const app = express()
const {persone} = require('./persone');

app.use(express.static('./public'));    //per inviare pagine html pronte
const path = __dirname + "/public";

const provamiddelware = (req, res, next) => {           //funzione aggiuntiva posta tra la richiesta e la risposta    
    const {method, url, requestTime} = req;
    console.log("Sono un middleware");
    console.log(`Method: ${method} \nUrl: ${url} \nRequestTime: ${requestTime}`);
    next();         //posso decidere se inviare la risposta direttamente dalla funzione oppure usare la funzione next per passare la richiesta al prossimo middleware o alla funzione di gestione della richiesta
};

const secondomidd = (req, res, next) => {
    console.log("Sono il secondo middleware");
    next();
};

app.use('/persone', provamiddelware);       //in questo modo dico al sistema di inserire un middleware all'interno di ogni route che inizia con /persone (in modo scalabile)

app.get('/', provamiddelware, secondomidd, (req, res) => {           //in mezzo tra richiesta e risposta piazzo una o più funzioni 
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

app.all('*', (req, res) => {       
    res.sendFile("error.html", {root: path});
});

const port = 3000;
app.listen(port);