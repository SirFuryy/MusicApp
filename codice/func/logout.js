async function logout(){
    let token = JSON.parse(sessionStorage.getItem('user')).token;
    console.log(token);
    await fetch("http://localhost:3000/logout", {
        method: 'POST',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.status === 'ok' || data.status === 'token error') {
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nel logout');
        }
    });
}

function mn(durata){
    const minutes = Math.floor(durata / 60000);
    const seconds = Math.floor((durata % 60000) / 1000);
    const duration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    return duration;
}

var canz = [];
async function cerca(daDove) {
    //ottieni input
    if (daDove === 'modal') {
        var input = document.getElementById('inputModal').value
    } else {
        var input = document.getElementById('inputRicerca').value;
        document.getElementById('inputModal').value = input;
    }
    

    //chiamata al server
    var token = JSON.parse(sessionStorage.getItem('user')).token;
    await fetch(`http://localhost:3000/search?input=${input}&type=all`, {
        method: 'GET',
        headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.status === 'ok') {
            var canzoni = data.value.canzoni;
            canz = [...data.value.canzoni];
            var playlist = data.value.playlist;
            var utenti = data.value.utenti;

            //stampa le canzoni
            var listaCanzoni = document.getElementById('listCanzoni');
            listaCanzoni.innerHTML = '';
            if (canzoni.length === 0) {         //se non ci sono canzoni
                let li = document.createElement('button');
                li.type = 'button';
                li.className = 'list-group-item list-group-item-action';
                li.innerHTML = '<p class="mb-1 fs-6">Nessuna canzone trovata</p>';
                listaCanzoni.appendChild(li);
            }
            var i = 1;
            canzoni.forEach(canzone => {
                if (i > 4) return;
                i++;
                let li = creaLiCanzone(canzone);
                listaCanzoni.appendChild(li);
            });
            canzoni.splice(0, 4);
            if (canzoni.length > 0) {       //se ci sono più di 4 canzoni
                let li = document.createElement('button');
                li.type = 'button';
                li.className = 'list-group-item list-group-item-action';
                li.onclick = function() {altreCanzoni(canzoni)};
                li.innerHTML = '<p class="mb-1 text-center fs-6">Altre canzoni</p>';
                listaCanzoni.appendChild(li);
            }

            //funzione per stampare le altre canzoni
            function altreCanzoni(canzoni) {
                listaCanzoni.removeChild(listaCanzoni.lastChild);
                canzoni.forEach(canzone => {
                    let li = creaLiCanzone(canzone);
                    listaCanzoni.appendChild(li);
                });
            }

            //funzione per creare il li delle canzoni
            function creaLiCanzone(canzone) {
                let autori = '';
                for (let i = 0; i < canzone.Autore.length-1; i++) {
                    autori += `${canzone.Autore[i]}, `;
                }
                autori += canzone.Autore[canzone.Autore.length-1];

                let i = 0;
                for (i; i < canz.length; i++) {
                    if (canz[i]._id === canzone._id || canz[i].idSpotify === canzone.idSpotify) break;
                }

                let li = document.createElement('button');
                li.type = 'button';
                li.setAttribute('data-bs-toggle', 'modal');
                li.setAttribute('data-bs-target', '#modalPlaylist');
                li.className = 'list-group-item list-group-item-action';
                li.onclick = function() {scegliPlaylist(i);};
                let html = `
                <div class='row'>
                    <div class='col-9'>
                        <p class='mb-1 fs-6'><b>${canzone.Titolo}</b><br>${autori}</p>
                    </div>
                    <div class='col-3'>
                        <p class='mb-1 text-end'>${mn(canzone.Durata)}</p>
                    </div>
                </div>` ;
                li.innerHTML = html;
                return li;
            }

            //stampa le playlist
            let listaPlaylist = document.getElementById('listPlaylist');
            listaPlaylist.innerHTML = '';
            if (playlist.length === 0) {
                let li = document.createElement('button');
                li.type = 'button';
                li.className = 'list-group-item list-group-item-action';
                li.innerHTML = '<p class="mb-1 fs-6">Nessuna playlist trovata</p>';
                listaPlaylist.appendChild(li);
            }
            var i = 1;
            playlist.forEach(elmPlaylist => {
                if (i > 4) return;
                i++;
                let li = creaLiPlaylist(elmPlaylist);
                listaPlaylist.appendChild(li);
                //let index = playlist.findIndex(item => item.titolo === elmPlaylist.titolo);
                //playlist.splice(index, 1);
            });
            playlist.splice(0, 4);
            if (playlist.length > 0) {
                let li = document.createElement('button');
                li.type = 'button';
                li.className = 'list-group-item list-group-item-action';
                li.onclick = function() {altrePlaylist(playlist)};
                li.innerHTML = '<p class="mb-1 text-center fs-6">Altre playlist</p>';
                listaPlaylist.appendChild(li);
            }

            //funzione per stampare altre playlist
            function altrePlaylist(playlist) {
                listaPlaylist.removeChild(listaPlaylist.lastChild);
                playlist.forEach(elmPlaylist => {
                    let li = creaLiPlaylist(elmPlaylist);
                    listaPlaylist.appendChild(li);
                });
            }

            //funzione per creare il li della playlist
            function creaLiPlaylist(elmPlaylist) {
                let tag = '';
                for (let i = 0; i < elmPlaylist.tag.length-1; i++) {
                    tag += `${elmPlaylist.tag[i]}, `;
                }
                tag += elmPlaylist.tag[elmPlaylist.tag.length-1];
                let li = document.createElement('button');
                li.type = 'button';
                li.className = 'list-group-item list-group-item-action';
                li.onclick = async function() {
                //ottiene gli elementi completi di una playlist per poi aprirne la pagina dedicata
                    await fetch(`http://localhost:3000/playlist/${elmPlaylist._id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'ok') {
                            sessionStorage.setItem('playlist', JSON.stringify(data.value));
                            window.location.replace('playlist.html');
                        } else if (result.status === 'token error') {
                            //eseguo il logout
                            sessionStorage.clear();
                            window.location.replace("index.html");
                        } else {
                            alert('Errore nella ricerca della playlist');
                        }
                    });
                };
                let html = `
                <div class='row'>
                    <div class='col-md-8'>
                        <p class='mb-1 fs-6'><b>${elmPlaylist.titolo}</b><br>Tag: ${tag}</p>
                    </div>
                    <div class='col-md-4'>
                        <div class='row'>
                            <div class='col-md-12'>
                                <p class='mb-1 text-end text-wrap'>${elmPlaylist.autore}</p>
                            </div>
                        </div>
                        <div class='row'>
                            <div class='col-12'>
                                <p class='mb-1 text-end'>Tracce: ${elmPlaylist.tracce.length}</p>
                            </div>
                        </div>
                    </div>
                </div>`;
                li.innerHTML = html;
                return li;
            }

            //stampa gli utenti
            let listaUtenti = document.getElementById('listUtenti');
            listaUtenti.innerHTML = '';
            if (canzoni.length === 0) {
                let li = document.createElement('button');
                li.type = 'button';
                li.className = 'list-group-item list-group-item-action';
                li.innerHTML = '<p class="mb-1 fs-6">Nessun utente trovato</p>';
                listaCanzoni.appendChild(li);
            }
            var i = 1;
            utenti.forEach(utente => {
                if (i > 4) return;
                i++;
                let li = creaLiUtenti(utente); 
                listaUtenti.appendChild(li);
                //let index = utenti.findIndex(item => item.nomeUtente === utente.nomeUtente);
                //utenti.splice(index, 1);
            });
            utenti.splice(0, 4);
            if (utenti.length > 0) {
                let li = document.createElement('button');
                li.type = 'button';
                li.className = 'list-group-item list-group-item-action';
                li.onclick = function() {altriUtenti(utenti)};
                li.innerHTML = '<p class="mb-1 text-center fs-6">Altri utenti</p>';
                listaUtenti.appendChild(li);
            }

            //funzione per stampare altri utenti
            function altriUtenti(utenti) {
                listaUtenti.removeChild(listaUtenti.lastChild);
                utenti.forEach(utente => {
                    let li = creaLiUtenti(utente);
                    listaUtenti.appendChild(li);
                });
            }

            //funzione per creare il li degli utenti
            function creaLiUtenti(utente) {
                let li = document.createElement('button');
                li.type = 'button';
                li.className = 'list-group-item list-group-item-action';
                li.onclick = async function() {
                    //ottiene gli elementi completi di una playlistper poi aprirne la pagina dedicata
                    await fetch(`http://localhost:3000/user/${utente._id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'ok') {
                            sessionStorage.setItem('amico', JSON.stringify(data.value));
                            window.location.replace('utenti.html');
                        } else if (result.status === 'token error') {
                            //eseguo il logout
                            sessionStorage.clear();
                            window.location.replace("index.html");
                        } else {
                            alert('Errore nella ricerca della playlist');
                        }
                    });
                };
                li.innerHTML = `
                <div class='row'>
                    <div class='col-8'>
                        <div class='row'>
                            <div class='col-12'>
                                <p class='mb-1 fs-5'><b>${utente.nomeUtente}</b></p>
                            </div>
                        </div>
                        <div class='row'>
                            <div class='col-12'>
                                <p class='mb-1 fs-6'>${utente.nome} ${utente.cognome}</p>
                            </div>
                        </div>
                    </div>
                    <div class='col-4'>
                        <div class='row'>
                            <div class='col-12'>
                                <p class='mb-1'>Playlist salvate: ${utente.playlist.length}</p>
                            </div>
                        </div>
                        <div class='row'>
                            <div class='col-12'>
                                <p class='mb-1'>Utenti seguiti: ${utente.utentiSeguiti.length}</p>
                            </div>
                        </div>
                    </div>
                </div>`;
                return li;
            }

        } else if (data.status === 'token error') {
            alert('Errore nel token');
            sessionStorage.clear();
            window.location.replace('index.html');
        } else {
            alert('Errore nella ricerca');
        }
    });
}

async function scegliPlaylist(index) {
    console.log(index)
    let canzone = canz[index];

    let autori = '';
    for (let i = 0; i < canzone.Autore.length-1; i++) {
        autori += `${canzone.Autore[i]}, `;
    }
    autori += canzone.Autore[canzone.Autore.length-1];

    document.getElementById('titAut').innerHTML = `<b>${canzone.Titolo}</b><br>${autori}`;
    document.getElementById('mn').innerHTML = mn(canzone.Durata);

    const token = JSON.parse(sessionStorage.getItem('user')).token;
    const id = JSON.parse(sessionStorage.getItem('user')).id;
    const utn = JSON.parse(sessionStorage.getItem('user')).nomeUtente

    var playlist = await fetch(`http://localhost:3000/user/${id}/playlist`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then((result) => {
        console.log(result);
        if (result.status === 'ok') {
            let p = [];
            result.value.forEach(elmPlaylist => {
                if (elmPlaylist.creatore === id) {
                    p.push(elmPlaylist);
                }
            });
            return p;
        } else if (result.status === 'void') {
            return null;
        } else if (result.status === 'token error') {
            //eseguo il logout
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nel caricamento delle playlist');
        }
    });

    var listaPlaylist = document.getElementById('listScegliPlaylist');
    listaPlaylist.innerHTML = '';

    if (playlist === null || playlist.length === 0) {
        let li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = '<p class="mb-1 fs-6">Non hai ancora creato nessuna playlist, clicca il bottone qui sotto per passare alla tua libreria e crearne una</p>';
        listaPlaylist.appendChild(li);
        document.getElementById('buttonModalScegli').innerHTML = 'Vai alla libreria';
        document.getElementById('buttonModalScegli').onclick = function() {
            window.location.replace('libreria.html');
        };
        return;
    }
    
    playlist.forEach(elmPlaylist => {
        let tag = '';
        for (let i = 0; i < elmPlaylist.tag.length-1; i++) {
            tag += `${elmPlaylist.tag[i]}, `;
        }
        tag += elmPlaylist.tag[elmPlaylist.tag.length-1];

        let li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <div class="row">
                <div class="col-md-9">
                    <div class="row">
                        <div class='col-9'>
                            <p class='mb-1 fs-6'><b>${elmPlaylist.titolo}</b><br>${tag}</p>
                        </div>
                        <div class='col-3'>
                            <p class='mb-1 text-end'>Tracce: ${elmPlaylist.tracce.length}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class='row'>
                        <div class="col">
                            <input type="radio" class="btn-check" name="playAdd" 
                            id="${elmPlaylist._id}" autocomplete="off">
                            <label class="btn btn-outline-success" for="${elmPlaylist._id}">Seleziona</label>
                        </div>
                    </div>
                </div>
            </div>` ;
        listaPlaylist.appendChild(li);
    });

    document.getElementById('buttonModalScegli').onclick = function() {
        modiPlaylist(index);
    };
}

async function modiPlaylist(index) {
    let canzone = canz[index];

    var idPlaylist = undefined;
    const selectedRadio = document.querySelector('input[name="playAdd"]:checked');
    if (selectedRadio) {
        idPlaylist = selectedRadio.id;
    } else {
        alert('Seleziona una playlist in cui aggiungere la canzone');
        return
    }

    if (canzone._id === undefined) {
        await fetch(`http://localhost:3000/song/${canzone._id}?type=spotifyId`, {
            method: 'GET',
            headers: {
                'autorization': `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                canzone._id = data.value._id;
            } else if (data.status === 'token error') {
                alert('Errore nel token');
                sessionStorage.clear();
                window.location.replace('index.html');
            } else {
                alert('Errore nell\'inserimento della canzone');
            }
        });
    }

    await fetch(`http://localhost:3000/playlist/${idPlaylist}/songs`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(sessionStorage.getItem("user")).token}`
        },
        body: JSON.stringify({
            idCanzone: canzone._id,
            durata: canzone.Durata
        })
    })
    .then(res => res.json())
    .then((result) => {
        console.log(result);
        if (result.status === 'ok') {
            alert('Canzone aggiunta con successo');
            //playlist.tracce.push(canzone._id);
            //sessionStorage.setItem('playlist', JSON.stringify(playlist));
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


/**
 * ricerca utenti dal database
 * ricerca playlist dal database
 * ricerca canzoni dal database
 *          --> ricerca canzoni da spotify
 */