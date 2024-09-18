const token = JSON.parse(sessionStorage.getItem('user')).token;
var userCompleto = [];


async function onload() {
    await caricadati();
    await elencoGeneri();

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

    document.getElementById("sessoPopUp").innerHTML = sessoMod;

    document.getElementById("dataNascitaPopUp").setAttribute('value', userCompleto.dataNascita);

    document.getElementById('nomeUtPopUp').value = userCompleto.nomeUtente;
    document.getElementById('nomePopUp').value = userCompleto.nome;
    document.getElementById('cognomePopUp').value = userCompleto.cognome;
    document.getElementById('artPrefPopUp').value = userCompleto.artistaPreferito;
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
    var nomeUtente = document.getElementById('nomeUtPopUp').value;
    var nome = document.getElementById('nomePopUp').value;
    var cognome = document.getElementById('cognomePopUp').value;
    var sesso = document.getElementById('sessoPopUp').value;
    var dataNascita = document.getElementById('dataNascitaPopUp').value;
    var artista = document.getElementById('artPrefPopUp').value;

    fetch(`http://localhost:3000/user/${JSON.parse(sessionStorage.getItem('user')).id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nomeUtente: nomeUtente,
            nome: nome,
            cognome: cognome,
            sesso: sesso,
            dataNascita: dataNascita,
            artistaPreferito: artista
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            alert('Profilo modificato con successo');
            window.location.reload();
        } else if (data.status === 'token error') {
            //eseguo il logout
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nella modifica del profilo');
        }
    })
}

function modificaPassword() {
    const passvecchia = document.getElementById('passVecchia').value;
    const passnuova = document.getElementById('passNuova').value;
    const passripetuta = document.getElementById('passRipet').value;

    if (passnuova !== passripetuta) {
        document.getElementById('errorePass').innerHTML = 'Le password nuove non coincidono';
        return;
    }

    if (passnuova.length < 8) {
        document.getElementById('errorePass').innerHTML = 'La password deve essere lunga almeno 8 caratteri';
        return;
    }

    fetch(`http://localhost:3000/user/password`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: JSON.parse(sessionStorage.getItem('user')).id,
            passvecchia: passvecchia,
            passnuova: passnuova})
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.status === 'ok') {
            alert('Password modificata con successo');
            window.location.reload();
        } else if (data.status === 'token error') {
            //eseguo il logout
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            document.getElementById('errorePass').innerHTML = 'La password vecchia non è corretta';
        }
    })
}

function showPassword(tipo) {
    var x = document.getElementById("pass"+tipo);
    var img = document.getElementById("immagine"+tipo);
    if (x.type === "password") {
        x.type = "text";
        img.src = "img\\occhio.png";
    } else {
        x.type = "password";
        img.src = "img\\occhiochiuso.png";
    }
}

async function elencoGeneri() {
    let generi = '';
    await fetch(`http://localhost:3000/caricaGeneri`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            generi = data.value;
            let generiHTML = '';
            generi.forEach(genere => {
                generiHTML += `
                    <div>
                        <input type="checkbox" id="${genere}" name="generi" value="${genere}">
                        <label for="${genere}">${genere}</label>
                    </div>
                `;
            });
            document.getElementById('generiM').innerHTML = generiHTML;
            for (let i = 0; i < userCompleto.generi.length; i++) {
                document.getElementById(userCompleto.generi[i]).checked = true;
            }
        } else if (data.status === 'token error') {
            //eseguo il logout
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nel caricamento dei generi');
        }
    })
}

function modificaGeneri() {
    let generi = [];
    let checkboxes = document.getElementsByName('generi');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            generi.push(checkbox.value);
        }
    });

    fetch(`http://localhost:3000/user/${JSON.parse(sessionStorage.getItem('user')).id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            generi: generi
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            alert('Generi modificati con successo');
            window.location.reload();
        } else if (data.status === 'token error') {
            //eseguo il logout
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nella modifica dei generi');
        }
    })
}

function eliminaProfilo() {
    let password = document.getElementById('passCancella').value

    if (password === '' || password.length < 8) {
        document.getElementById('avvisoPass').innerHTML = 'La password deve essere lunga almeno 8 caratteri';
        return
    }

    fetch(`http://localhost:3000/user/${JSON.parse(sessionStorage.getItem('user')).id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            alert('Profilo eliminato con successo');
            sessionStorage.clear();
            window.location.replace("index.html");
        } else if (data.status === 'token error') {
            //eseguo il logout
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            document.getElementById('avvisoPass').innerHTML = 'La password non è corretta';
        }
    })
}