let data;
function setupReg() {
    let loginForm = document.getElementById('login-form');
    let registerForm = document.getElementById('register-form');

    // Nascondi il form di accesso
    loginForm.style.display = 'none';

    // Mostra il form di registrazione
    registerForm.style.display = 'block';
}

function setupAcc() {
    let loginForm = document.getElementById('login-form');
    let registerForm = document.getElementById('register-form');

    // Nascondi il form di accesso
    loginForm.style.display = 'block';

    // Mostra il form di registrazione
    registerForm.style.display = 'none';
}

function showPasswordAcc() {
    const passwordField = document.getElementById('pswAcc');
    const imgAcc = document.getElementById('immagineAcc');
    if (passwordField.type === 'text') {
        passwordField.type = 'password';
        imgAcc.src = 'img/occhiochiuso.png';
    } else {
        passwordField.type = 'text';
        imgAcc.src = 'img/occhio.png';
    }
}

function showPasswordReg() {
    const passwordField = document.getElementById('pswReg');
    const imgReg = document.getElementById('immagineReg');
    if (passwordField.type === 'text') {
        passwordField.type = 'password';
        imgReg.src = 'img/occhiochiuso.png';
    } else {
        passwordField.type = 'text';
        imgReg.src = 'img/occhio.png';
    }
}

function showConfPasswordReg() {
    const passwordField = document.getElementById('confPswReg');
    const imgReg = document.getElementById('confImmagineReg');
    if (passwordField.type === 'text') {
        passwordField.type = 'password';
        imgReg.src = 'img/occhiochiuso.png';
    } else {
        passwordField.type = 'text';
        imgReg.src = 'img/occhio.png';
    }
}

function continuaRegistrazione() {
    const nomUtente = document.getElementById('nomUt').value;
    if (nomUtente === '') {
        alert('Inserisci il nome utente');
        return;
    }
    const password = document.getElementById('pswReg').value;
    const confPassword = document.getElementById('confPswReg').value;
    if (password === '') {
        alert('Inserisci la password');
        return;
    }
    if (confPassword === '') {
        alert('Conferma la password');
        return;
    }
    if (password !== confPassword) {
        alert('Le password non corrispondono');
        return;
    }

    // Save the data
    const data = {
        nomeUtente: nomUtente,
        password: password
    };
    sessionStorage.setItem('data', JSON.stringify(data));   // uso dei cooie

    // Load the new page
    window.location.href = 'registrazione.html';
}

async function accedi() {
    const email = document.getElementById('email').value;
    if (email === '') {
        alert('Inserisci il nome utente');
        return;
    }

    const password = document.getElementById('pswAcc').value;
    if (password === '') {
        alert('Inserisci la password');
        return;
    }

    await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
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
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during login');
        });
}