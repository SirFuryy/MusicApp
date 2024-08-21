const express = require('express'); //importo il modulo express
const app = express();              //creo un'istanza di express

app.get('/', (req, res) => {        //creo una route per la home page del server
    res.send('Benvenuto nella home page del web server');
});

app.get('/about', (req, res) => {       //creo una route per la pagina about
  res.send('<h3>About</h3><p>Benvenuto nella pagina about</p>')
})

app.get('/contatti', (req, res) => {        //creo una route per la pagina contatti
  res.send('<h3>Contatti</h3><p>Benvenuto nella pagina contatti</p>')
})

app.all('*', (req, res) => {        //creo una route per tutte le altre pagine non definite o con ricerche errate
    res.send("<h1>Pagina non trovata</h1><p>Torna alla pagina <a href='/'>home</a></p>");
});



//come inviare file statici, come ad esempio pagine html, css, immagini, ecc
app.use(express.static('./public'));         //dico ad express di usare i file statici presenti nella cartella public



app.listen(3000);                   //faccio ascoltare il server sulla porta 3000