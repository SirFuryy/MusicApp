async function logout(){

    await fetch("http://localhost:3000/logout", {
        method: 'POST',
        headers: {
            authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            sessionStorage.clear();
            window.location.replace("index.html");
        } else {
            alert('Errore nel logout');
        }
    });
}