//esempi di un utilizzo reale, con tanto di lavoro in postman

const express = require('express')
const app = express()
const {persone} = require('./persone');

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static('./public'));    //per inviare pagine html pronte
const path = __dirname + "/public";

app.get('/', (req, res) => {
    res.sendFile("homepage.html", {root: path});
});

app.get('/api/persone', (req, res) => {         //GET risponde
    res.status(200).json({success: true, data: persone});
});

app.get('/api/persone/:id', (req, res) => {
    res.status(200).json({success: true, data: persone[req.params.id]});
});

app.post('/api/persone', (req, res) => {        //post vuole un body
    console.log(req.body);
    const persona = req.body;
    persone.push(persona);
    res.status(201).json({success: true, data: persone});
});

app.put('/api/persone/:id', (req, res) => {     //put vuole un body
    const {id} = req.params;
    const persona = req.body;
    persone[Number(id) - 1] = persona;
    res.status(200).json({success: true, data: persone});
});

app.delete('/api/persone/:id', (req, res) => {      //delete non vuole un body
    const {id} = req.params;
    const perElim = persone.findIndex(persona => persona.id === id);
    persone.splice(perElim, 1);
    res.status(200).json({success: true, data: persone});
});


const port = 3000;
app.listen(port);
console.log(`Server in ascolto sulla porta ${port}`);