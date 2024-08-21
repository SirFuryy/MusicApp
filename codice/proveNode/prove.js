console.log(__dirname);         // cartella in cui siamo
console.log(require);           // funzione per importare moduli, ovvero pacchetti di codice js da riusare
console.log(__filename);        // nome del file in cui siamo
console.log(process);           // informazioni sul processo in esecuzione
console.log(module);            // informazioni sul modulo in esecuzione

//concetto di asincrono --> avvio una funzione, la faccio andare in background e nel mentre vado avanti con il codice, magari avviando altre funzioni. Qunado la funzione finisce, essa esegue una callback, ovvero una funzione che viene eseguita al termine della funzione asincrona. Questo è utile per non bloccare il codice, soprattutto in caso di operazioni lunghe come richieste http o operazioni di I/O

//creazione di un server http sulla porta 3000, ovvero che resta sempre in ascolto di richieste http creando una pagina web dedicata alla gestione delle richieste
const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.end('Benvenuto nella home page del web server');
    } else if (req.url === '/api') {
        res.write(JSON.stringify([1, 2, 3, 4]));
        res.end();
    } else if (req.url === '/personale') {
        res.write('Benvenuto nella pagina personale della persona x');
        res.end();
    } else {
        res.end("<style>body{background-color: lightblue;}</style><h3>Pagina non trovata</h3><p>La pagina che stai cercando non esiste, torna alla pagina <a href='/'>home</a></p>")
    }
});

server.listen(3000);

//package json importante per la gestione dei pacchetti e delle dipendenze del progetto, nonchè per le informazioni sul progetto, sul diritto d'autore e sul creatore.
//npm init per inizializzare un progetto npm
//con npm install e basta posso installare tutte le dipendenze presenti nel package.json, qualora non le abbia già installate
//package-lock.json serve per bloccare le versioni dei pacchetti installati, in modo che il progetto sia sempre riproducibile



//Fondamentali di node.js

//imbastimento dell'emitter
const EventEmitter = require('events');
const customEmitter = new EventEmitter();

customEmitter.on('messaggio', () => {            //mi "iscrivo" all'evento chiamato messaggio
  console.log("ho ricevuto l'emissione dell'evento messaggio");    //poi eseguo una callback quando avviene l'evento
});

customEmitter.on('messaggio', (nome, anno, umpalumpa) => {     //posso iscrivermi più volte allo stesso evento
  console.log(`ciao ${nome} benvenuto nell'anno ${anno} ${umpalumpa}`);                    //e posso accettare parametri in base a quanti ne passo nell'emissione dell'evento    
});

console.log("tra on ed emit");

customEmitter.emit('messaggio');                 //emetto l'evento chiamato messaggio

customEmitter.emit('messaggio', 'luca', 2023);                 //posso emettere l'evento con tanti parametri che poi verranno passati alla callback se essa li accetta

