const playlist = JSON.parse(sessionStorage.getItem('playlist'));
var brani = [];
function onload() {
    document.getElementById('titolo').innerHTML = playlist.titolo;
    document.getElementById('descrizione').innerHTML = playlist.descrizione;
    const minutes = Math.floor(playlist.durata / 60);
    const seconds = playlist.durata % 60;
    document.getElementById('autore').innerHTML =playlist.autore + ' - ' + minutes + ':' + seconds;

    
    
    caricaBrani();
    for (let i = 0; i < playlist.tracce.length; i++) {
        
    }
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
    }
}