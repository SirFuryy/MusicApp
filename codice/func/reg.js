let elencoGeneri, elencoArtisti = [];
let data = JSON.parse(sessionStorage.getItem('data'));
console.log(data);

async function onload() {
    document.getElementById('nomeut').innerText = "Ciao " + data.nomeUtente + ", continua la registrazione:";

    await fetch("http://localhost:3000/caricaGeneri")
        .then(res => res.json())
        .then((gener) => {
            console.log(gener);
            elencoGeneri = gener;
    });

    document.getElementById('nomeut').innerText = "Ciao ", data.nomeUtente, " , continua la registrazione:";

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
    .then(res => {
        sessionStorage.clear();
        if (res.status === 'ok') {
            sessionStorage.setItem('user', JSON.stringify({
                id: res.id,
                nomeUtente: nome
            }));
            window.location.href = 'homepage.html';
        } else {
            alert('Errore nella registrazione');
        }
    });
}

function caricaGeneri() {
    let generiDiv = document.getElementById('generiPreferiti');

    console.log(elencoGeneri);

    elencoGeneri.forEach(gen => {
        let genereDiv = document.createElement('div');
        genereDiv.className = 'form-check';
        genereDiv.innerHTML = `
            <input class="form-check-input" type="checkbox" name="genere" value="${gen}">
            <label class="form-check-label" for="">${gen}</label>
        `;
        generiDiv.appendChild(genereDiv);
    });
}