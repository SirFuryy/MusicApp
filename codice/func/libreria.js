const id = JSON.parse(sessionStorage.getItem('user')).id;
const token = JSON.parse(sessionStorage.getItem('user')).token;
var playlist = [];

function onload() {
    
    const nomUt = JSON.parse(sessionStorage.getItem('user')).nomeUtente;
    const sesso = JSON.parse(sessionStorage.getItem('user')).sesso;

    if (sesso === 'M') {
        document.getElementById('Nome').innerHTML = "Benvenuto " + nomUt;
    } else {
        document.getElementById('Nome').innerHTML = "Benvenuta " + nomUt;
    }

    caricaPlaylist();

}

async function aggiungiPlaylist() {
    const titolo = document.getElementById('popupTitle').value;
    const descrizione = document.getElementById('popupDescription').value;

    if (titolo.trim() === '' || descrizione.trim() === '') {
        alert('Il titolo e la descrizione non possono essere vuoti');
        return;
    }

    const tag1 = document.getElementById('tag1').value;
    const tag2 = document.getElementById('tag2').value;
    const tag3 = document.getElementById('tag3').value;
    const tag4 = document.getElementById('tag4').value;

    if (tag1.trim() === '' || tag2.trim() === '' || tag3.trim() === '' || tag4.trim() === '') {
        alert('Inserisci i quattro tag');
        return;
    }

    const pubblica = document.getElementById('popupPrivate').checked;

    await fetch(`http://localhost:3000/playlist`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            titolo: titolo,
            descrizione: descrizione,
            tag: [tag1, tag2, tag3, tag4],
            creatore: id,
            autore: JSON.parse(sessionStorage.getItem('user')).nomeUtente,
            durata: 0,
            tracce: [],
            pubblica: !(pubblica)
        })
    })
    .then(res => res.json())
    .then((result) => {
        console.log(result);
        if (result.status === 'ok') {
            alert('Playlist creata con successo');
            window.location.reload();
        } else if (result.status === 'token error') {
            //eseguo il logout
            console.log('token error libreria');
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nella creazione della playlist');
        }
    });
}

async function caricaPlaylist() {
    await fetch(`http://localhost:3000/user/${id}/playlist`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then((result) => {
        console.log(result);
        if (result.status === 'ok') {
            playlist = result.value;
            document.getElementById('descrizione').innerHTML = "Attualmente ne hai: " + playlist.length;
            generaTabella();
        } else if (result.status === 'void') {
            document.getElementById('descrizione').innerHTML = "Attualmente non hai playlist";
        } else if (result.status === 'token error') {
            //eseguo il logout
            console.log('token error prop');
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nel caricamento delle playlist');
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
        row.onclick = function() {                  
            sessionStorage.setItem('playlist', JSON.stringify(playlist[i]));
            window.location.href = 'playlist.html';
        };
        row.insertCell(0).innerHTML = playlist[i].titolo;
        row.insertCell(1).innerHTML = playlist[i].descrizione;
        row.insertCell(2).innerHTML = tag;
        const minutes = Math.floor(playlist[i].durata / 60000);
        const seconds = Math.floor((playlist[i].durata % 60000) / 1000);
        let formSeconds = seconds < 10 ? '0' + seconds : seconds;
        row.insertCell(3).innerHTML =  playlist[i].tracce.length + ' - ' + minutes + ':' + formSeconds;
        if (playlist[i].creatore === id) {
            row.insertCell(4).innerHTML = `Si`;
        } else {
            row.insertCell(4).innerHTML = `No`;
        }


    }
}