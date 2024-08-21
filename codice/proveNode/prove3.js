const express = require('express'); 
const app = express();              


//come inviare file statici, come ad esempio pagine html, css, immagini, ecc
app.use(express.static('./public'));         //dico ad express di usare i file statici presenti nella cartella public
const path = __dirname + "/public";


app.get('/', (req, res) => {        //invece di una normale send invio un file html
    res.sendFile("homepage.html", {root: path});
});

app.get('/about', (req, res) => {
    res.sendFile("about.html", {root: path});
});

//ovviamente adeesso quando da una pagina html passo ad un'altra attaraverso il bottone href passo comunque dal coontrollo del server e non vado più diretto da html a html (devo dunque scaricare i  documenti che mi vengono passati dal sevrer express)


//per inviare un json semplicemnte uso il metodo json
const {persone} = require('./persone');
app.get('/json', (req, res) => {
   res.json(persone);
});
//per chiamare un file json esterno prima devo importare il modulo fs e poi leggere il file json e inviarlo come json, sempre comunque usando il metodo json.


app.all('*', (req, res) => {       
    res.sendFile("error.html", {root: path});
});


app.listen(3000); 