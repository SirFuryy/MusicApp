import express from "express";
import { getgenere } from "./response/getgenere.js";
import {registrazione} from "./response/registrazione.js";
import mongoSanitize from 'express-mongo-sanitize';
import {login} from "./response/login.js";
import {playlistPubbliche, playlistUtente, playlistSingola, modificaPlaylist, eliminaPlaylist, creaPlaylist } from "./response/playlist.js";
import {utentiMisti, utenteSingolo, amiciUtente, modificaUtente, modificaSeguiti, eliminaUtente, modificaPassword, modificaElencoPlaylist} from "./response/user.js";
import {canzoneSingola, canzoneSingolaDB, canzoniMultiple, modificaCanzonePlaylist, canzoniMultipleDB} from "./response/song.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument  from "./swagger-output.json" assert { type: "json" };
import cors from 'cors';
const app = express();  // Creazione dell'app Express

// Middleware per il parsing del corpo delle richieste
app.use(express.json()); 
// Middleware per la protezione da NoSQL Injection 
app.use(mongoSanitize());

app.use(express.static('./public'));
//opzioni per il CORS
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
  methods: "GET, PUT, POST, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization"
}
app.use(cors(corsOptions));
app.options('*', cors())

//swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument ));

const uri = "mongodb+srv://SIrFuryy:<password>@ddp.mszpcku.mongodb.net/?retryWrites=true&w=majority";
const path = 'codice';
var generi = ['acoustic',          'afrobeat',       'alt-rock',
  'alternative',       'ambient',        'anime',
  'black-metal',       'bluegrass',      'blues',
  'bossanova',         'brazil',         'breakbeat',
  'british',           'cantopop',       'chicago-house',
  'children',          'chill',          'classical',
  'club',              'comedy',         'country',
  'dance',             'dancehall',      'death-metal',
  'deep-house',        'detroit-techno', 'disco',
  'disney',            'drum-and-bass',  'dub',
  'dubstep',           'edm',            'electro',
  'electronic',        'emo',            'folk',
  'forro',             'french',         'funk',
  'garage',            'german',         'gospel',
  'goth',              'grindcore',      'groove',
  'grunge',            'guitar',         'happy',
  'hard-rock',         'hardcore',       'hardstyle',
  'heavy-metal',       'hip-hop',        'holidays',
  'honky-tonk',        'house',          'idm',
  'indian',            'indie',          'indie-pop',
  'industrial',        'iranian',        'j-dance',
  'j-idol',            'j-pop',          'j-rock',
  'jazz',              'k-pop',          'kids',
  'latin',             'latino',         'malay',
  'mandopop',          'metal',          'metal-misc',
  'metalcore',         'minimal-techno', 'movies',
  'mpb',               'new-age',        'new-release',
  'opera',             'pagode',         'party',
  'philippines-opm',   'piano',          'pop',
  'pop-film',          'post-dubstep',   'power-pop',
  'progressive-house', 'psych-rock',     'punk',
  'punk-rock',         'r-n-b',          'rainy-day',
  'reggae',            'reggaeton',      'road-trip',
  'rock',              'rock-n-roll',    'rockabilly',
  'romance',           'sad',            'salsa', 
  'samba',             'sertanejo',      'show-tunes',
  'singer-songwriter', 'ska',            'sleep',
  'songwriter',        'soul',           'soundtracks',
  'spanish',           'study',          'summer',
  'swedish',           'synth-pop',      'tango',
  'techno',            'trance',         'trip-hop',
  'turkish',           'work-out',       'world-music'];
var artisti = [];
var tokenlist = [
  {
    token: 'bcp352pf2qq78ij48dan54',
    user: 'emily.smith@example.com',
    time: 1724928586091
  }
];

app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Definizione delle rotte
app.get('/caricaGeneri', async (req, res) => {      //restituisce i generi musicali
  console.log("** route generi")
    res.status(200).json({status: 'ok', code: 200, value: generi});

});

app.post('/registrazione', async (req, res) => {    //effettua la registrazione
  console.log("** route " + req.url);
    const data = req.body;
    await registrazione(data)
    .then((result) => {
        res.status(result.code).json(result);
    });
});

app.post('/login', async (req, res) => {    //effettua il login
  console.log("** route " + req.url);
    const data = req.body;
    await login(data)
    .then((result) => {
      if (result.status === 'ok') {
        const currentTime = new Date().getTime();
        tokenlist.push({token: result.value.token, user: result.value.email, time: currentTime});
        console.log(tokenlist);
        res.status(result.code).json({status: result.status, user: result.value});
      } else {
        res.status(result.code).json(result);
      }
    });
});

app.post('/user/password', checkToken, async (req, res) => {    //modifica la password
  console.log("** route " + req.url);
  const data = req.body;
  const token = req.headers.authorization.replace("Bearer ", "");
  await modificaPassword(data, token)
  .then((result) => {
      res.status(result.code).json(result);
  });
});

app.post('/logout', checkToken, (req, res) => {   //effettua il logout
  console.log("** route " + req.url);
  const token = req.headers.authorization.replace("Bearer ", "");
  for (let index = 0; index < tokenlist.length; index++) {
    if (tokenlist[index].token === token) {
      tokenlist.splice(index, 1);
      break;   
    }
  }
  res.status(200).json({status: "ok" , code:200, value: "Logout effettuato"});
});

app.get('/user/:id/playlist', checkToken, async (req, res) => {  //restituisce le playlist dell'utente
  console.log("** route " + req.url);
    var id = req.params.id;
    var token = req.headers.authorization.replace("Bearer ", "");
    await playlistUtente(id, token)
    .then((result) => {
        console.log("qui fatto")
        res.status(result.code).json(result);
    });
});

app.get('/playlist', checkToken, async (req, res) => {      //restituisce le playlist pubbliche
  console.log("** route " + req.url);
    const {limit} = req.query;
    playlistPubbliche(limit)
    .then((result) => {
        console.log("playlist pubbliche torna con "+ result.value)
        res.status(result.code).json(result);
    });
});

app.get('/playlist/:id', async (req, res) => {   //restituisce la playlist con id specifico
  console.log("** route " + req.url);
    var id  = req.params.id;
    await playlistSingola(id)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.get('/user', async (req, res) => {    //restituisce una lista di utenti
  console.log("** route " + req.url);
    const {limit} = req.query;
    await utentiMisti(limit)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.get('/user/:id', async (req, res) => {    //restituisce un utente
  console.log("** route " + req.url);
    var id  = req.params.id;
    var token = req.headers.authorization.replace("Bearer ", "");
    await utenteSingolo(id, token)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.get('/user/:id/users', checkToken, async (req, res) => {    //restituisce la lista di amici di un utente
  console.log("** route " + req.url);
    var id  = req.params.id;
    console.log("endpoint user")
    await amiciUtente(id)
    .then((result) => {
      console.log(result)
      res.status(result.code).json(result);
    });
});

app.get('/song/:id', async (req, res) => {    //restituisce una canzone
  console.log("** route " + req.url);
    var id  = req.params.id;
    await canzoneSingolaDB(id)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.post('/song', async (req, res) => {    //restituisce una lista di canzoni
  console.log("** route " + req.url);
    const {idCanzoni} = req.body;
    await canzoniMultipleDB(idCanzoni)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.put('/user/:id', async (req, res) => {    //modifica un utente
  console.log("** route " + req.url);
    var id  = req.params.id;
    const data = req.body;
    const token = req.headers.authorization.replace("Bearer ", "");
    await modificaUtente(id, data, token)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.put('/user/:id/users', checkToken, async (req, res) => {    //aggiunge/toglie un follow
  console.log("** route " + req.url);
    var id  = req.params.id;
    const data = req.body.id;
    const token = req.headers.authorization.replace("Bearer ", ""); 
    await modificaSeguiti(id, data, token)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

  /*
    CONTROLLARE:
      errore nello stack trace, status code non valido ex riga 194
      controllare di non aggiungere lo stesso utente più volte
  */ 

app.put('/playlist/:id/modifica', checkToken, async (req, res) => {    //modifica una playlist
  console.log("** route " + req.url);
    var id  = req.params.id;
    const data = req.body;
    await modificaPlaylist(id, data)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.put('/user/:id/playlist', checkToken, async (req, res) => {    //aggiunge/rimuove una playlist da un utente
  console.log("** route " + req.url);
    var id  = req.params.id;
    const {idPlaylist} = req.body;
    const token = req.headers.authorization.replace("Bearer ", "");
    await modificaElencoPlaylist(id, idPlaylist, token)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.put('/playlist/:id/songs', checkToken, async (req, res) => {    //aggiunge/rimuove una canzone da una playlist
  console.log("** route " + req.url);
    var id  = req.params.id;
    const {idCanzone, durata} = req.body;
    await modificaCanzonePlaylist(id, idCanzone)
    .then(async (result) => {
      if (result.status === 'ok') {
        let durataPlaylist = await playlistSingola(id);
        let dur = durataPlaylist.value.durata;
        if (result.value === 'canzone inserita') {
          dur += durata;
          await modificaPlaylist(id, {durata: dur})
          .then((ress) => {
            res.status(ress.code).json(ress);
          });
        } else {
          dur -= durata;
          await modificaPlaylist(id, {durata: dur})
          .then((ress) => {
            res.status(ress.code).json(ress);
          });
        }
      }
      return res;
    });
});

app.delete('/playlist/:id', checkToken, async (req, res) => {    //elimina una playlist
  console.log("** route " + req.url);
    var id  = req.params.id;
    const token = req.headers.authorization.replace("Bearer ", "");
    const idRichiedente = req.body.idRichiedente;
    await eliminaPlaylist(id, token, idRichiedente)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.delete('/user/:id', async (req, res) => {    //elimina un utente
  console.log("** route " + req.url);
    var id = req.params.id;
    const token = req.headers.authorization.replace("Bearer ", "");
    const password = req.body.password;
    await eliminaUtente(id, token, password)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.post('/playlist', checkToken, async (req, res) => {    //crea una playlist
  console.log("** route " + req.url);
    const data = req.body;
    await creaPlaylist(data.creatore, data)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.get('/search', async (req, res) => {    //ricerca
  console.log("** route " + req.url);
});



// Avvio del server
const port = 3000;
(async () => {          //riattiva la funzione getgenere ogni 24 ore
    //generi = await getgenere();
    
    setInterval(async () => {
      generi = await getgenere();
    }, 24 * 60 * 60 * 1000);
  
  
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  
})();

//middelware per il controllo del token. Se il token non viene utilizzato
//per più di 10 minuti di fila viene eliminato
function checkToken(req, res, next) {
  const currentTime = new Date().getTime(); 
  const tenMinutesAgo = new Date(currentTime - (1000 * 60 * 1000)).getTime(); 
  
  const token = req.headers.authorization.replace("Bearer ", "");
  let trovato = false;
  for (let index = 0; index < tokenlist.length; index++) {
    if (tokenlist[index].token === token) {
      trovato = true;
      console.log("trovato "+token);
      if (tokenlist[index].time <= tenMinutesAgo) {
        console.log("token scaduto" + tokenlist[index].time);
        tokenlist.splice(index, 1);
        return res.status(401).json({status: "token error", code:401, message: "Token scaduto"});
      } else {
        tokenlist[index].time = currentTime; 
        console.log("Token aggiornato");
        next();
      }
    }
  }

  if (!trovato) {
    console.log("token non trovato:", token);
    return res.status(401).json({status: "token error", code:401, message: "Token non valido"});
  }
}

//restituisce la mail di un token
function findMail(token){
  for (let index = 0; index < tokenlist.length; index++) {
    if (tokenlist[index].token === token) {
      return tokenlist[index].user;
    }
  }
}