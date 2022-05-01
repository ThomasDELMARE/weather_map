// C'est ici que l'utilisateur est redirigé lorsqu'il essaye de s'authentifier
async function login(event) {
    event.preventDefault();
    inputLogin = document.getElementById("inputLogin").value
    inputPassword = document.getElementById("inputPassword").value

    if (inputLogin != "" && inputLogin != null && inputPassword != "" && inputPassword != null) {
        try {
            // On vérifie que l'utilisateur a donné les bons identifiants
            await postData('/confirmUserAuthentication', inputLogin, inputPassword)
                .then(data => {
                    location.reload()
                });

        } catch (err) {
            console.log("Login request failed because of : ", err)
            location.reload()
            document.getElementById("inputPassword").value = ""
            document.getElementById("inputLogin").value = ""
        }
    }
}

// Permet de lancer la requête de vérification de l'utilisateur
async function postData(url = '', login, password) {
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login: login, password: password })
    });
    return 200;
}