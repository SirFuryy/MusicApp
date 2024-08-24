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
        if (data.status === 'ok') {
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nel logout');
        }
    });
}

function libPers() {
    window.location.replace("libreria.html");
}