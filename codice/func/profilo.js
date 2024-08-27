const token = JSON.parse(sessionStorage.getItem('user')).token;
var userCompleto = [];


async function onload() {
    await caricadati();

    document.getElementById('nomeUt').innerHTML = `Benvenuto ${userCompleto.nomeUtente}, qui sono riepilogati  i tuoi dati personali, che puoi modificare attraverso il pulsante Modifica`;

    document.getElementById('nome').innerHTML = `<b>Nome: </b>${userCompleto.nome}`;

    document.getElementById('cognome').innerHTML = `<b>Cognome: </b>${userCompleto.cognome}`;

    document.getElementById('email').innerHTML = `<b>Email: </b>${userCompleto.email_text}`;

    document.getElementById('password').innerHTML = `<b>Password: </b>********`;

    document.getElementById('sesso').innerHTML = `<b>Sesso: </b>${userCompleto.sesso}`;

    document.getElementById('dataNascita').innerHTML = `<b>Data di nascita: </b>${userCompleto.dataNascita}`;

    let textGeneri = "<b>Generi preferiti: </b>";

    for (let i = 0; i < userCompleto.generi.length; i++) {
        if (i === userCompleto.generi.length - 1) {
            textGeneri += userCompleto.generi[i];
        } else {
            textGeneri += userCompleto.generi[i] + ", ";
        }
    }
   
    document.getElementById('generi').innerHTML = textGeneri;

    document.getElementById('artista').innerHTML = `<b>Artista preferito: </b>${userCompleto.artistaPreferito}`;

    document.getElementById('utentiSeg').innerHTML = `Attualmente segui <b>${userCompleto.utentiSeguiti.length}</b> utenti`;

    document.getElementById('playlist').innerHTML = `Attualmente hai <b>${userCompleto.playlist.length}</b> playlist in libreria`;

    let sessoMod = '';
    if (userCompleto.sesso === 'M') {
        sessoMod = '<option value="M" selected>Maschio</option><option value="F">Femmina</option>';
    } else {
        sessoMod = '<option value="M">Maschio</option><option value="F" selected>Femmina</option>';
    }

    document.getElementById("sessoPopUp").innerHTML = '<option value="M">Maschio</option><option value="F">Femmina</option>';
}

async function caricadati() {
    await fetch(`http://localhost:3000/user/${JSON.parse(sessionStorage.getItem('user')).id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        userCompleto = data.value;
    })

}

function modificaProfilo() {

}