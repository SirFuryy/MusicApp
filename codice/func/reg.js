let elencoGeneri, elencoArtisti = [];
let data = JSON.parse(sessionStorage.getItem('data'));
console.log(data);

async function onload() {
    document.getElementById('nomeut').innerText = "Ciao " + data.nomeUtente + ", continua la registrazione:";

    await fetch("http://localhost:3000/caricaGeneri")
        .then(res => res.json())
        .then((gener) => {
            console.log(gener);
            elencoGeneri = gener.value;
    });

    caricaGeneri();
};

async function registrazione() {
    const email = document.getElementById('emailReg').value;
    if (email === '') {
        alert('Inserisci una email valida');
        return;
    }
    const nome = document.getElementById('Nome').value;
    if (nome === '') {
        alert('Inserisci il nome');
        return;
    }
    const cognome = document.getElementById('Cognome').value;
    if (cognome === '') {
        alert('Inserisci il cognome');
        return;
    }

    const dataNascita = document.getElementById('dataNascita').value;
    const today = new Date();
    const birthDate = new Date(dataNascita);
    const diffInYears = today.getFullYear() - birthDate.getFullYear();

    if (diffInYears < 14) {
        alert('Devi avere almeno 14 anni per registrarti');
        return; 
    } else if (dataNascita === 'Invalid Date') {
        alert('Inserisci una data di nascita valida');
        return;
    }

    const generi = document.getElementsByName('genere');
    let generiSelezionati = [];
    generi.forEach(genere => {
        if (genere.checked) {
            generiSelezionati.push(genere.value);
        }
    });

    if (generiSelezionati.length === 0) {
        alert('Seleziona almeno un genere');
        return;
    }

    data = {
        ...data,
        email: email,
        nome: nome,
        cognome: cognome,
        sesso: document.getElementById('sesso').value,
        dataNascita: dataNascita,
        generi: generiSelezionati
    };

    const artista = document.getElementById('artistaPref').value;
    if (artista !== '') {
        data = {
            ...data,
            artistaPreferito: artista,
            utentiSeguiti: [],
            playlist: []
        };
    }

    console.log(data);

    await fetch('http://localhost:3000/registrazione', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(async (res) => {
        sessionStorage.clear();
        if (res.status === 'ok') {
            await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: data.password
                })
            })
            .then(response => response.json())
            .then(result => {
                if (result.status === 'ok') {
                    // Login successful
                    console.log("ciao" + result.user._id);
                    dataUtente = {
                        id: result.user._id,
                        nomeUtente: result.user.nomeUtente,
                        email: result.user.email,
                        sesso: result.user.sesso,
                        utentiSeguiti: result.user.utentiSeguiti,
                        playlist: result.user.playlist,
                        token: result.user.token
                    }
                    sessionStorage.setItem('user', JSON.stringify(dataUtente));
                    // Redirect to homepage
                    window.location.href = 'homepage.html';
                } else {
                    // Login failed
                    document.getElementById('erroreLogin').innerHTML = '<b>Nome utente o password errati</b>';
                    alert('Login failed');
                }
            })
        } else {
            alert('Errore nella registrazione: ' + res.error);
        }
    });
}

function caricaGeneri() {
    let generiDiv = document.getElementById('generiPreferiti');

    console.log(elencoGeneri);
    let i = 0;
    let row = document.createElement('div');
    row.className = 'row mb-2 mx-1';

    elencoGeneri.forEach(gen => {
        if (i === 4) {
            generiDiv.appendChild(row);
            row = document.createElement('div');
            row.className = 'row mb-2 mx-1';
            i = 0;
        }
        let col = document.createElement('div');
        col.className = 'col-lg-3';
        col.innerHTML = `
            <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" name="genere" value="${gen}" id="${gen}">
            <label class="form-check-label mx-2" for="${gen}">${gen}</label>
            </div>
        `;
        row.appendChild(col);
        i++;
    });

    generiDiv.appendChild(row);
}