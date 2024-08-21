import express from "express";
import { getgenere } from "./response/getgenere.js";
import {registrazione} from "./response/registrazione.js";
import mongoSanitize from 'express-mongo-sanitize';
import {login} from "./response/login.js";
import {playlistPubbliche, playlistUtente, playlistSingola, modificaPlaylist, eliminaPlaylist, creaPlaylist } from "./response/playlist.js";
import {utentiMisti, utenteSingolo, amiciUtente, modificaUtente, modificaSeguiti, eliminaUtente} from "./response/user.js";
import {canzoneSingola, canzoneSingolaDB, canzoniMultiple, modificaCanzonePlaylist, canzoniMultipleDB} from "./response/song.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument  from "./swagger-output.json" assert { type: "json" };
const app = express();  // Creazione dell'app Express

// Middleware per il parsing del corpo delle richieste
app.use(express.json()); 
// Middleware per la protezione da NoSQL Injection 
app.use(mongoSanitize());

app.use(express.static('./public'));
//opzioni per il CORS
app.use((req, res, next)=>{         
res.setHeader('Access-Control-Allow-Origin', '*')
res.setHeader('Access-Control-Allow-Method', 'POST,GET,PUT,DELETE,OPTIONS')
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
next();
})
//swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument ));

const uri = "mongodb+srv://SIrFuryy:<password>@ddp.mszpcku.mongodb.net/?retryWrites=true&w=majority";
const path = 'codice';
let generi, artisti = [];
var tokenlist = [
  {
    token: 'kbp6ytktrsn811muuin6c',
    user: 'emily.smith@example.com',
    time: 1724166303947
  }
];

app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Definizione delle rotte
app.get('/caricaGeneri', (req, res) => {      //restituisce i generi musicali
    res.json(generi);
});

app.post('/registrazione', async (req, res) => {    //effettua la registrazione
    const data = req.body;
    await registrazione(data)
    .then((result) => {
        res.status(result.code).json(result);
    });
});

app.post('/login', async (req, res) => {    //effettua il login
    const data = req.body;
    await login(data)
    .then((result) => {
      //se il login è andato a buon fine viene creato un token
      if (result.status === 'ok') {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        console.log("creo "+token);
        const currentTime = new Date().getTime();
        tokenlist.push({token: token, user: result.value.email, time: currentTime});
        res.status(result.code).json({status: result.status, token: token, user: result.value});
      } else {
        res.status(result.code).json(result);
      }
    });
});

app.post('/user/password', checkToken, async (req, res) => {    //modifica la password
  const data = req.body;
  await modPassword(data)
  .then((result) => {
      res.status(result.code).json(result);
  });
});

app.post('/logout', checkToken, (req, res) => {   //effettua il logout
  const token = req.headers.authorization.replace("Bearer ", "");
  for (let index = 0; index < tokenlist.length; index++) {
    if (tokenlist[index].token === token) {
      tokenlist.splice(index, 1);
      break;   
    }
  }
  res.status(200).json({ status:ok , code:200, value: "Logout effettuato"});
});

app.get('/user/:id/playlist', checkToken, async (req, res) => {  //restituisce le playlist dell'utente
  console.log("uscito dal middle")
    var id = req.params.id;
    await playlistUtente(id)
    .then((result) => {
        console.log("qui fatto")
        res.status(result.code).json(result);
    });
});

app.get('/playlist', checkToken, async (req, res) => {      //restituisce le playlist pubbliche
    const {limit} = req.query;
    playlistPubbliche(limit)
    .then((result) => {
        res.status(result.code).json(result);
    });
});

app.get('/playlist/:id', async (req, res) => {   //restituisce la playlist con id specifico
    var id  = req.params.id;
    await playlistSingola(id)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.get('/user', async (req, res) => {    //restituisce una lista di utenti
    const {limit} = req.query;
    await utentiMisti(limit)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.get('/user/:id', async (req, res) => {    //restituisce un utente
    var id  = req.params.id;
    await utenteSingolo(id)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.get('/user/:id/users', checkToken, async (req, res) => {    //restituisce la lista di amici di un utente
    var id  = req.params.id;
    console.log("endpoint user")
    await amiciUtente(id)
    .then((result) => {
      console.log(result)
      res.status(result.code).json(result);
    });
});

app.get('/song/:id', async (req, res) => {    //restituisce una canzone
    var id  = req.params.id;
    await canzoneSingolaDB(id)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.post('/song', async (req, res) => {    //restituisce una lista di canzoni
    const {idCanzoni} = req.body;
    await canzoniMultipleDB(idCanzoni)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.put('/user/:id', async (req, res) => {    //modifica un utente
    var id  = req.params.id;
    const data = req.body;
    await modificaUtente(id, data)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.put('/user/:id/users', async (req, res) => {    //aggiunge/toglie un follow
    var id  = req.params.id;
    const data = req.body;
    await modificaSeguiti(id, data)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.put('/playlist/:id', async (req, res) => {    //modifica una playlist
    var id  = req.params.id;
    const data = req.body;
    await modificaPlaylist(id, data)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.put('/playlist/:id/songs', async (req, res) => {    //aggiunge/rimuove una canzone da una playlist
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
          .then((res) => {
            res.status(res.code).json(res);
          });
        } else {
          dur -= durata;
          await modificaPlaylist(id, {durata: dur})
          .then((res) => {
            res.status(res.code).json(res);
          });
        }
      }
      res.status(result.code).json(result);
    });
});

app.delete('/playlist/:id', async (req, res) => {    //elimina una playlist
    var id  = req.params.id;
    await eliminaPlaylist(id)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.delete('/user/:id', async (req, res) => {    //elimina un utente
    var id = req.params.id;
    await eliminaUtente(id)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.post('/playlist', async (req, res) => {    //crea una playlist
    const data = req.body;
    await creaPlaylist(data)
    .then((result) => {
      res.status(result.code).json(result);
    });
});

app.get('/search', async (req, res) => {    //ricerca
    
});


// Avvio del server
const port = 3000;
(async () => {          //riattiva la funzione getgenere ogni 24 ore
    generi = await getgenere();
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