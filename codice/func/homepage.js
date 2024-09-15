const id = JSON.parse(sessionStorage.getItem('user')).id;
const token = JSON.parse(sessionStorage.getItem('user')).token;
var playlistProprie = [];
var playlistPubbliche = [];
var amici = [];

function onload() {
    const nomUt = JSON.parse(sessionStorage.getItem('user')).nomeUtente;
    const sesso = JSON.parse(sessionStorage.getItem('user')).sesso;
    const benv = sesso === 'M' ? 'Benvenuto' : 'Benvenuta';
    document.getElementById('benvenuto').innerHTML = '<b>' + benv +' ' + nomUt + '</b>';

    

    gestisciProprie();
    gestisciPubbliche();
    gestisciAmici();
}

function apriAmici(id) {
    for (let i = 0; i < amici.length; i++) {
        if (amici[i]._id === id) {
            sessionStorage.setItem('amico', JSON.stringify(amici[i]));
            break;
        }
    }
    window.location.href = 'utenti.html';
}

function apriPlaylist(id) {
    let trovato = false;
    for (let i = 0; i < playlistProprie.length; i++) {
        if (playlistProprie[i]._id === id) {
            trovato = true;
            sessionStorage.setItem('playlist', JSON.stringify(playlistProprie[i]));
            break;
        }
    }
    
    if (!trovato) {
        for (let i = 0; i < playlistPubbliche.length; i++) {
            if (playlistPubbliche[i]._id === id) {
                sessionStorage.setItem('playlist', JSON.stringify(playlistPubbliche[i]));
                break;
            }
        }
    }
    window.location.href = 'playlist.html';
}

async function gestisciAmici() {
    await fetch(`http://localhost:3000/user/${id}/users`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then((result) => {
        if (result.status === 'ok') {
            amici = result.value;
            document.getElementById('testaAmici').innerHTML = `I tuoi amici  
            <button class="btn btn-primary" type="button" data-bs-target="#carouselIdAmici" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            </button>
            <button class="btn btn-primary" type="button" data-bs-target="#carouselIdAmici" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
            </button>`;
            creaCarte(result.value, "Amici", result.value.length);
        } else if (result.status === 'void') {
            document.getElementById('testaAmici').innerHTML = 'I tuoi amici';
            document.getElementById('rigaAmici').innerHTML = '<h2>Non hai amici seguiti</h2>';
        } else if (result.status === 'token error') {
            //eseguo il logout
            console.log('token error am');
            setTimeout(() => {
                10*1000 
            });
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            document.getElementById('testaAmici').innerHTML = 'I tuoi amici';
            document.getElementById('rigaAmici').innerHTML = '<h2>Errore</h2>';
        }
    });
}

async function gestisciPubbliche() {
    await fetch(`http://localhost:3000/playlist?limit=9`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then((result) => {
        if (result.status === 'ok') {
            playlistPubbliche = result.value;
            document.getElementById('testaPubbliche').innerHTML = `Playlist pubbliche più recenti  
            <button class="btn btn-primary" type="button" data-bs-target="#carouselIdPubbliche" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            </button>
            <button class="btn btn-primary" type="button" data-bs-target="#carouselIdPubbliche" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
            </button>`;
            console.log(result.value);
            creaCarte(result.value, "Pubbliche", result.value.length);
        } else if (result.status === 'void') {
            document.getElementById('testaPubbliche').innerHTML = 'Playlist pubbliche più recenti';
            document.getElementById('rigaPubbliche').innerHTML = '<h2>Non ci sono playlist consigliate</h2>';
        } else if (result.status === 'token error') {
            //eseguo il logout
            console.log('token error pub');
            setTimeout(() => {
                10*1000 
            });
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            document.getElementById('testaPubbliche').innerHTML = 'Playlist pubbliche più recenti';
            document.getElementById('rigaPubbliche').innerHTML = '<h2>Errore</h2>';
        }
    });
}

async function gestisciProprie() {
    await fetch(`http://localhost:3000/user/${id}/playlist`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then((result) => {
        if (result.status === 'ok') {
            playlistProprie = result.value;
            document.getElementById('testaPlaylist').innerHTML = `Le tue playlist  
            <button class="btn btn-primary" type="button" data-bs-target="#carouselIdPlaylist" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            </button>
            <button class="btn btn-primary" type="button" data-bs-target="#carouselIdPlaylist" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
            </button>`;
            creaCarte(result.value, "Playlist", result.value.length);
        } else if (result.status === 'void') {
            document.getElementById('testaPlaylist').innerHTML = 'Le tue playlist';
            document.getElementById('rigaPlaylist').innerHTML = '<h2>Non hai playlist</h2>';
        } else if (result.status === 'token error') {
            //eseguo il logout
            console.log('token error prop');
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            document.getElementById('testaPlaylist').innerHTML = 'Le tue playlist';
            document.getElementById('rigaPlaylist').innerHTML = '<h2>Errore</h2>';
        }
    });
}

function creaCarte(elementi, tipo, nElementi) {
    rigaEsterna = document.getElementById("riga"+tipo);
    const carouselDiv = document.createElement("div");
    carouselDiv.id = "carouselId"+tipo;
    carouselDiv.className = "carousel slide";
    carouselDiv.setAttribute("data-bs-ride", "carousel");
    rigaEsterna.appendChild(carouselDiv);

    const carouselInner = document.createElement("div");
    carouselInner.className = "carousel-inner";
    carouselInner.setAttribute("role", "listbox");
    carouselDiv.appendChild(carouselInner);

    let divisions = Math.ceil(nElementi / 3);
    for (let i = 0; i < divisions; i++) {
        const carouselItem = document.createElement("div");
        carouselItem.className = "carousel-item";
        if (i === 0) {
            carouselItem.className += " active";
        }
        carouselInner.appendChild(carouselItem);

        const row = document.createElement("div");
        row.className = "row";
        carouselItem.appendChild(row);
        let end = Math.min(i*3 + 3, nElementi);
        for (let j = i*3; j<end; j++) {
            let ind = i*3+j;
            const col = document.createElement("div");
            col.className = "col-4";
            row.appendChild(col);

            const card = document.createElement("div");
            card.className = "card text-white bg-dark";
            card.id = elementi[j].titolo
            if (tipo === "Playlist" || tipo === "Pubbliche") {
                card.setAttribute("onclick", "apriPlaylist('"+elementi[j]._id+"')");
            } else {
                card.setAttribute("onclick", "apriAmici('"+elementi[j]._id+"')");
            }
            
            
            const cardBody = document.createElement("div");
            cardBody.className = "card-body";

            const cardTitle = document.createElement("h4");
            cardTitle.className = "card-title";

            const cardText = document.createElement("p");
            cardText.className = "card-text";

            col.appendChild(card);
            

            if (tipo === "Playlist" || tipo === "Pubbliche") {
                const cardHeader = document.createElement("div");
                cardHeader.className = "card-header";

                const cardFooter = document.createElement("div");
                cardFooter.className = "card-footer";

                let tag = "";
                for (let k = 0; k < elementi[j].tag.length; k++) {
                    tag += elementi[j].tag[k];
                    if (k < elementi[j].tag.length - 1) {
                        tag += ", ";
                    }
                }

                cardHeader.innerHTML = "Tags: " + tag;
                cardTitle.innerHTML = elementi[j].titolo;
                cardText.innerHTML = elementi[j].descrizione;

                if (tipo === "Playlist") {
                    let min = Math.floor(elementi[j].durata / 60000);
                    let sec = Math.floor((elementi[j].durata % 60000) / 1000);
                    let secForm = sec < 10 ? '0' + sec : sec;
                    cardFooter.innerHTML = min + ":" + secForm;
                } else if (tipo === "Pubbliche") {
                    cardFooter.innerHTML = elementi[j].autore;
                }

                card.appendChild(cardHeader);
                card.appendChild(cardBody);
                cardBody.appendChild(cardTitle);
                cardBody.appendChild(cardText);
                card.appendChild(cardFooter);
            }

            if (tipo === "Amici") {
                const cardFooter = document.createElement("div");
                cardFooter.className = "card-footer";

                cardTitle.innerHTML = elementi[j].nomeUtente;
                cardText.innerHTML = "Playlist create: "+elementi[j].playlist.length;

                cardFooter.innerHTML = elementi[j].generi;

                card.appendChild(cardBody);
                cardBody.appendChild(cardTitle);
                cardBody.appendChild(cardText);
                card.appendChild(cardFooter);
            }            
        }
    }
}

/**
 * <div id="carouselId" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-inner" role="listbox">
                                <div class="carousel-item active">
                                    <div class="row">
                                        <div class="col-4">
                                            <div class="card text-white bg-dark" >
                                                <div class="card-header">Header</div>
                                                <div class="card-body">
                                                    <h4 class="card-title">Title</h4>
                                                    <p class="card-text">Text</p>
                                                </div>
                                                <div class="card-footer text-muted">Footer</div>
                                            </div>
                                            
                                        </div>
                                        <div class="col-4">
                                            <div class="card text-white bg-dark" >
                                                <div class="card-header">Header</div>
                                                <div class="card-body">
                                                    <h4 class="card-title">Title</h4>
                                                    <p class="card-text">Text</p>
                                                </div>
                                                <div class="card-footer text-muted">Footer</div>
                                            </div>
                                            
                                        </div>
                                        <div class="col-4">
                                            <div class="card text-white bg-dark">
                                                <div class="card-header">Header</div>
                                                <div class="card-body">
                                                    <h4 class="card-title">Title</h4>
                                                    <p class="card-text">Text</p>
                                                </div>
                                                <div class="card-footer text-muted">Footer</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                                <div class="carousel-item">
                                    <img
                                        src="holder.js/900x500/auto/#666:#444/text:Second slide"
                                        class="w-100 d-block"
                                        alt="Second slide"
                                    />
                                </div>
                                <div class="carousel-item">
                                    <img
                                        src="holder.js/900x500/auto/#666:#444/text:Third slide"
                                        class="w-100 d-block"
                                        alt="Third slide"
                                    />
                                </div>
                            </div>
                            
                            
                        </div>
 */