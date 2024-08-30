const playlist = JSON.parse(sessionStorage.getItem('playlist'));
var brani = [];
const proprietario = playlist.creatore === JSON.parse(sessionStorage.getItem('user')).id ? true : false;


function onload() {
    document.getElementById('titolo').innerHTML = playlist.titolo;
    document.getElementById('descrizione').innerHTML = playlist.descrizione;
    const minutes = Math.floor(playlist.durata / 60);
    const seconds = playlist.durata % 60;
    document.getElementById('autore').innerHTML =playlist.autore + ' - ' + minutes + ':' + seconds;

    if (proprietario) {
        document.getElementById('btnModPlaylist').style.display = 'flex';
        document.getElementById('popupTitle').value = playlist.titolo;
        document.getElementById('popupDescription').value = playlist.descrizione;
        document.getElementById('tag1').value = playlist.tag[0];
        document.getElementById('tag2').value = playlist.tag[1];
        document.getElementById('tag3').value = playlist.tag[2];
        document.getElementById('tag4').value = playlist.tag[3];
        
        if (playlist.pubblica) {
            document.getElementById('popupPrivate').checked = false;
        } else {
            document.getElementById('popupPrivate').checked = true;
        }

        document.getElementById('btnElmPlaylist').style.display = 'flex';
        document.getElementById('btnAddSong').style.display = 'flex';
    } else {
        let pluser = JSON.parse(sessionStorage.getItem('user')).playlist;
        let trovato = false;
        for (let i=0; i<pluser.length; i++) {
            if (pluser[i] === playlist._id) {
                trovato = true;
                break;
            }
        }

        if (trovato) {
            document.getElementById('btnRmPlaylist').style.display = 'flex';
        } else {
            document.getElementById('btnAddPlaylist').style.display = 'flex';
        }
    }
    
    caricaBrani();
}

async function caricaBrani() {
    await fetch(`http://localhost:3000/song`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'idCanzoni': playlist.tracce
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            brani = data.value;
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

async function modificaPlaylist() {
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

    await fetch(`http://localhost:3000/playlist/${playlist._id}/modifica`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(sessionStorage.getItem("user")).token}`
        },
        body: JSON.stringify({
            titolo: titolo,
            descrizione: descrizione,
            tag: [tag1, tag2, tag3, tag4],
            pubblica: !(pubblica)
        })
    })
    .then(res => res.json())
    .then((result) => {
        console.log(result);
        if (result.status === 'ok') {
            alert('Playlist modificata con successo');
            const newPlaylist = {
                _id: playlist._id,
                titolo: titolo,
                descrizione: descrizione,
                tag: [tag1, tag2, tag3, tag4],
                pubblica: !(pubblica),
                autore: playlist.autore,
                creatore: playlist.creatore,
                tracce: playlist.tracce,
                durata: playlist.durata
            };
            sessionStorage.setItem('playlist', JSON.stringify(newPlaylist));
            window.location.reload();
        } else if (result.status === 'token error') {
            //eseguo il logout
            console.log('token error libreria');
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nella modifica della playlist');
        }
    });
}

async function rimuoviCanzone(index) {
    await fetch(`http://localhost:3000/playlist/${playlist._id}/songs`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(sessionStorage.getItem("user")).token}`
        },
        body: JSON.stringify({
            idCanzone: brani[index]._id,
            durata: brani[index].Durata
        })
    })
    .then(res => res.json())
    .then((result) => {
        console.log(result);
        if (result.status === 'ok') {
            alert('Canzone rimossa con successo');
            playlist.tracce.splice(index, 1);
            brani.splice(index, 1);
            sessionStorage.setItem('playlist', JSON.stringify(playlist));
            window.location.reload();
        } else if (result.status === 'token error') {
            //eseguo il logout
            console.log('token error libreria');
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nella rimozione della canzone');
        }
    });
}

function generaTabella() {
    console.log(brani[0]);
    const tabBody = document.getElementById('tabCanzoni');
    

    for (let i = 0; i < brani.length; i++) {
        let Autori = "";
        let generi = "";
        for (let j = 0; j < brani[i].Autore.length; j++) {
            if (j === brani[i].Autore.length - 1) {
                Autori += brani[i].Autore[j];
            } else {
                Autori += brani[i].Autore[j] + ", ";
            }
        }

        for (let j = 0; j < brani[i].Genere.length; j++) {
            if (j === brani[i].Genere.length - 1) {
                generi += brani[i].Genere[j];
            } else {
                generi += brani[i].Genere[j] + ", ";
            }
        }
        const row = tabBody.insertRow();
        row.insertCell(0).innerHTML = brani[i].Titolo;
        row.insertCell(1).innerHTML = Autori;
        row.insertCell(2).innerHTML = generi;
        const minutes = Math.floor(brani[i].Durata / 60);
        const seconds = brani[i].Durata % 60;
        row.insertCell(3).innerHTML =  minutes + ':' + seconds;
        if (proprietario) {
            document.getElementById('colRimuovi').style.display = 'flex';
            row.insertCell(4).innerHTML = `<button class="deleteButton" onclick="rimuoviCanzone(${i})">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 50 59"
    class="bin"
  >
    <path
      fill="#B5BAC1"
      d="M0 7.5C0 5.01472 2.01472 3 4.5 3H45.5C47.9853 3 50 5.01472 50 7.5V7.5C50 8.32843 49.3284 9 48.5 9H1.5C0.671571 9 0 8.32843 0 7.5V7.5Z"
    ></path>
    <path
      fill="#B5BAC1"
      d="M17 3C17 1.34315 18.3431 0 20 0H29.3125C30.9694 0 32.3125 1.34315 32.3125 3V3H17V3Z"
    ></path>
    <path
      fill="#B5BAC1"
      d="M2.18565 18.0974C2.08466 15.821 3.903 13.9202 6.18172 13.9202H43.8189C46.0976 13.9202 47.916 15.821 47.815 18.0975L46.1699 55.1775C46.0751 57.3155 44.314 59.0002 42.1739 59.0002H7.8268C5.68661 59.0002 3.92559 57.3155 3.83073 55.1775L2.18565 18.0974ZM18.0003 49.5402C16.6196 49.5402 15.5003 48.4209 15.5003 47.0402V24.9602C15.5003 23.5795 16.6196 22.4602 18.0003 22.4602C19.381 22.4602 20.5003 23.5795 20.5003 24.9602V47.0402C20.5003 48.4209 19.381 49.5402 18.0003 49.5402ZM29.5003 47.0402C29.5003 48.4209 30.6196 49.5402 32.0003 49.5402C33.381 49.5402 34.5003 48.4209 34.5003 47.0402V24.9602C34.5003 23.5795 33.381 22.4602 32.0003 22.4602C30.6196 22.4602 29.5003 23.5795 29.5003 24.9602V47.0402Z"
      clip-rule="evenodd"
      fill-rule="evenodd"
    ></path>
    <path fill="#B5BAC1" d="M2 13H48L47.6742 21.28H2.32031L2 13Z"></path>
  </svg>

  <span class="tooltip">Delete</span>
</button>
`;
        }
    }
}

/*
<div class="d-flex gap-2">
        <button class="deleteButton" onclick="rimuoviPlaylist(${i})">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 50 59" class="bin">
        <path fill="#B5BAC1" d="M0 7.5C0 5.01472 2.01472 3 4.5 3H45.5C47.9853 3 50 5.01472 50 7.5V7.5C50 8.32843 49.3284 9 48.5 9H1.5C0.671571 9 0 8.32843 0 7.5V7.5Z"></path>
        <path fill="#B5BAC1" d="M17 3C17 1.34315 18.3431 0 20 0H29.3125C30.9694 0 32.3125 1.34315 32.3125 3V3H17V3Z"></path>
        <path
        fill="#B5BAC1"
        d="M2.18565 18.0974C2.08466 15.821 3.903 13.9202 6.18172 13.9202H43.8189C46.0976 13.9202 47.916 15.821 47.815 18.0975L46.1699 55.1775C46.0751 57.3155 44.314 59.0002 42.1739 59.0002H7.8268C5.68661 59.0002 3.92559 57.3155 3.83073 55.1775L2.18565 18.0974ZM18.0003 49.5402C16.6196 49.5402 15.5003 48.4209 15.5003 47.0402V24.9602C15.5003 23.5795 16.6196 22.4602 18.0003 22.4602C19.381 22.4602 20.5003 23.5795 20.5003 24.9602V47.0402C20.5003 48.4209 19.381 49.5402 18.0003 49.5402ZM29.5003 47.0402C29.5003 48.4209 30.6196 49.5402 32.0003 49.5402C33.381 49.5402 34.5003 48.4209 34.5003 47.0402V24.9602C34.5003 23.5795 33.381 22.4602 32.0003 22.4602C30.6196 22.4602 29.5003 23.5795 29.5003 24.9602V47.0402Z"
        clip-rule="evenodd" fill-rule="evenodd"></path>
        <path fill="#B5BAC1" d="M2 13H48L47.6742 21.28H2.32031L2 13Z"></path>
    </svg>
    <span class="tooltip">Elimina</span>
    </button>
 
<button class="edit-button">
  <svg class="edit-svgIcon" viewBox="0 0 512 512">
                    <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                  </svg>
                  <span class="tooltip">Modifica</span>
</button></div>7
*/

async function aggiungiCanzone(idCanzone, durata, titolo, autore, genere) {
    await fetch(`http://localhost:3000/playlist/${playlist._id}/songs`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(sessionStorage.getItem("user")).token}`
        },
        body: JSON.stringify({
            idCanzone: idCanzone,
            durata: durata
        })
    })
    .then(res => res.json())
    .then((result) => {
        console.log(result);
        if (result.status === 'ok') {
            alert('Canzone aggiunta con successo');
            playlist.tracce.push(idCanzone);
            brani.push({
                _id: idCanzone,
                Titolo: titolo,
                Autore: autore,
                Genere: genere,
                Durata: durata
            });
            sessionStorage.setItem('playlist', JSON.stringify(playlist));
            window.location.reload();
        } else if (result.status === 'token error') {
            //eseguo il logout
            console.log('token error libreria');
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nella aggiunta della canzone');
        }
    });
}

async function eliminaPlaylist() {
    await fetch (`http://localhost:3000/playlist/${playlist._id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
            'content-Type': 'application/json'
        },
        body: JSON.stringify({
            idRichiedente: JSON.parse(sessionStorage.getItem('user')).id
        })
    })
    .then(res => res.json())
    .then((result) => {
        console.log(result);
        if (result.status === 'ok') {
            alert('Playlist eliminata con successo');
            window.location.replace('libreria.html');
        } else if (result.status === 'token error') {
            //eseguo il logout
            console.log('token error libreria');
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nell\'eliminazione della playlist');
        }
    });
}

async function apriUtente() {
    await fetch (`http://localhost:3000/user/${playlist.creatore}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`
        }
    })
    .then(res => res.json())
    .then((result) => {
        console.log(result);
        if (result.status === 'ok') {
            sessionStorage.setItem('amico', JSON.stringify(result.value));
            window.location.href = 'utenti.html';
        } else if (result.status === 'token error') {
            //eseguo il logout
            console.log('token error libreria');
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nel caricamento dell\'utente');
        }
    });
}

var user = JSON.parse(sessionStorage.getItem('user'));
async function aggiungiPlaylist() {
    let copia = user.playlist;
    copia.push(playlist._id);
    await fetch (`http://localhost:3000/user/${user.id}/playlist`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'content-Type': 'application/json'
        },
        body: JSON.stringify({
            idPlaylist: playlist._id
        })
    })
    .then(res => res.json())
    .then((result) => {
        console.log(result);
        if (result.status === 'ok') {
            alert('Playlist aggiunta con successo');
            user.playlist = copia;
            sessionStorage.setItem('user', JSON.stringify(user));
            window.location.reload();
        } else if (result.status === 'token error') {
            //eseguo il logout
            console.log('token error libreria');
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nell\'aggiunta della playlist');
        }
    });
}

async function rimuoviPlaylist() {
    let copia = user.playlist;
    copia.splice(copia.indexOf(playlist._id), 1);
    await fetch (`http://localhost:3000/user/${user.id}/playlist`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'content-Type': 'application/json'
        },
        body: JSON.stringify({
            idPlaylist: playlist._id
        })
    })
    .then(res => res.json())
    .then((result) => {
        console.log(result);
        if (result.status === 'ok') {
            alert('Playlist rimossa con successo');
            user.playlist = copia;
            sessionStorage.setItem('user', JSON.stringify(user));
            window.location.reload();
        } else if (result.status === 'token error') {
            //eseguo il logout
            console.log('token error libreria');
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nella rimozione della playlist');
        }
    });
}