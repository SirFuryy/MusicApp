const amico = JSON.parse(sessionStorage.getItem('amico'));
var amici = [];
var playlist = [];
const token = JSON.parse(sessionStorage.getItem('user')).token;



function onload() {
    document.getElementById('Nome').innerHTML = amico.nomeUtente;

    let desc = "Generi preferiti: ";
    for (let i = 0; i < amico.generi.length; i++) {
        if (i === amico.generi.length - 1) {
            desc += amico.generi[i];
        } else {
            desc += amico.generi[i] + ", ";
        }
    }
    desc += ";\n Artista preferito: <u>" + amico.artistaPreferito + "</u>";
    document.getElementById('descrizione').innerHTML = desc;
    
    caricaAmici();
    caricaPlaylist();
}

async function caricaAmici() {
    await fetch(`http://localhost:3000/user/${amico._id}/users`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            amici = data.value;
            let text = 'Segue ';
            if (amici.length === 0) {
                text = 'Non segue nessun utente';
            } else if (amici.length === 1) {
                text += amici[0].nomeUtente;
            } else if (amici.length === 2) {
                text += amici[0].nomeUtente + ' e ' + amici[1].nomeUtente;
            } else if (amici.length === 3) {
                text += amici[0].nomeUtente + ', ' + amici[1].nomeUtente + ' e un altro utente';
            } else {
                text += amici[0].nomeUtente + ', ' + amici[1].nomeUtente + ' e altri ' + (amici.length - 2) + ' utenti';
            }
            document.getElementById('amici').innerHTML = text;
        } else if (data.status === 'token error') {
            //eseguo il logout
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nel caricamento degli amici');
        }
    });
}

async function caricaPlaylist() {
    await fetch(`http://localhost:3000/user/${amico._id}/playlist`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            playlist = data.value;
            generaTabella();
        } else if (data.status === 'token error') {
            //eseguo il logout
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nel caricamento dei brani');
        }
    });   
}

function generaTabella() {
    const tabBody = document.getElementById('tabPlaylist');

    for (let i = 0; i < playlist.length; i++) {
        let tag = "";
        for (let j = 0; j < playlist[i].tag.length; j++) {
            if (j === playlist[i].tag.length - 1) {
                tag += playlist[i].tag[j];
            } else {
                tag += playlist[i].tag[j] + ", ";
            }
        }

        const row = tabBody.insertRow();
        row.insertCell(0).innerHTML = playlist[i].titolo;
        row.insertCell(1).innerHTML = playlist[i].descrizione;
        row.insertCell(2).innerHTML = tag;
        const minutes = Math.floor(playlist[i].durata / 60);
        const seconds = playlist[i].durata % 60;
        row.insertCell(3).innerHTML =  playlist[i].tracce.length + ' - ' + minutes + ':' + seconds;
    }
}