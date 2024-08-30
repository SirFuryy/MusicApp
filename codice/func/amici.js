const user = JSON.parse(sessionStorage.getItem('user'))
const token = user.token;
var amici = [];

function onload() {
    if (user.sesso === 'M') {
        document.getElementById('Nome').innerHTML = "Benvenuto " + user.nomeUtente;
    } else {
        document.getElementById('Nome').innerHTML = "Benvenuta " + user.nomeUtente;
    }
    caricaAmici();
}

function caricaAmici() {
    fetch(`http://localhost:3000/user/${user.id}/users`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then((result) => {
        console.log(result);
        if (result.status === 'ok') {
            amici = result.value;
            console.log(amici);
            document.getElementById('descrizione').innerHTML = "Attualmente ne hai: " + amici.length;
            generaTabella();
        } else if (result.status === 'token error') {
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nel caricamento dei brani');
        }
    });
}

async function rimuoviAmico(index) {
    await fetch(`http://localhost:3000/user/${user.id}/users`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: amici[index]._id})
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            alert('Amico rimosso con successo');
            window.location.reload();
        } else if (data.status === 'token error') {
            //eseguo il logout
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert("Errore nella rimozione dell'amico" + data.error);
        }
    });
}

function generaTabella() {
    const tabBody = document.getElementById('tabAmici');
    
    for (let i = 0; i < amici.length; i++) {
        let generi = "";

        for (let j = 0; j < amici[i].generi.length; j++) {
            if (j === amici[i].generi.length - 1) {
                generi += amici[i].generi[j];
            } else {
                generi += amici[i].generi[j] + ", ";
            }
        }
        const row = tabBody.insertRow();
        row.insertCell(0).innerHTML = amici[i].nomeUtente;
        row.insertCell(1).innerHTML = amici[i].playlist.length;
        row.insertCell(2).innerHTML = amici[i].artistaPreferito;
        row.insertCell(3).innerHTML = generi;
        row.insertCell(4).innerHTML = `<button class="deleteButton" onclick="rimuoviAmico(${i})">
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

