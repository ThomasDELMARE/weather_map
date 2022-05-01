async function login(event) {
    event.preventDefault();
    console.log("On essaye d'authentifier l'utilisateur.")
    inputLogin = document.getElementById("inputLogin").value
    inputPassword = document.getElementById("inputPassword").value

    console.log(inputLogin)
    console.log(inputPassword)

    if (inputLogin != "" && inputLogin != null && inputPassword != "" && inputPassword != null) {
        try {
            // var xhr = new XMLHttpRequest();
            // xhr.open("POST", "/confirmUserAuthentication", true);
            // xhr.setRequestHeader('Content-Type', 'application/json');
            // xhr.send(JSON.stringify({ login: inputLogin, password: inputPassword }));

            // let result = await fetch("/confirmUserAuthentication", {
            //     mode: "no-cors",
            //     method: 'POST',
            //     body: JSON.stringify({ login: inputLogin, password: inputPassword }),
            //     headers: {
            //         'Content-Type': 'application/json'
            //     }
            // }).then((response) => {
            //     console.log("Je suis en train de finir")
            //     return response.json()

            // }).catch((error) => {
            //     console.log(error)
            // })

            // console.log("le result tu connais : ", result)
            // console.log("Soon redirected")

            await postData('/confirmUserAuthentication')
                .then(data => {
                    console.log(data);
                    location.reload()
                });

        } catch (err) {
            console.log("Login request failed because of : ", console.log(err))
        }
    }
}


// Example POST method implementation:
async function postData(url = '') {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        body: JSON.stringify({ login: inputLogin, password: inputPassword }) // body data type must match "Content-Type" header
    });
    return 200; // parses JSON response into native JavaScript objects
}

async function redirectToHomePage() {
    // Default options are marked with *
    const response = await fetch("/home", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}