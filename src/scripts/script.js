// Déclaration des variables
let allowed = true; // Permettra de limiter les requêtes envoyées

// Main
main();

//https://www.educative.io/edpresso/how-to-create-tabs-in-html
function clickHandle(evt, animalName) {
    let i, tabcontent, tablinks;

    // This is to clear the previous clicked content.
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Set the tab to be "active".
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Display the clicked tab and set it to active.
    document.getElementById(animalName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Permet de récupérer tous les utilisateurs
async function retrieveAllUsers() {
    // On ne veut pas faire de requête pendant qu'une autre est en cours
    if (!allowed) return
    allowed = false;

    // Récupère tous les utilisateurs
    var currentUsers = await fetch('/fetchAllUsers')
        .then(function(response) {
            return response.json()
        })
        .then(function(responseJson) {
            return responseJson
        })

    document.getElementById("espList").innerHTML = null
    knownUsers = [] // Permettra de ne pas ajouter deux fois le même utilisateur

    for (let i = 0; i < currentUsers.length; i++) {
        // On ajoute à une liste pour éviter de répéter plusieurs fois la même adresse
        if (!knownUsers.includes(currentUsers[i].address)) {
            knownUsers.push(currentUsers[i].address)
            actionString = "'" + currentUsers[i].address + "'"
            document.getElementById("espList").innerHTML += "<div class='row list-group list-group-horizontal'><div class='col list-group-item'>" + currentUsers[i].address + `</div><div class="col"><button type=\"button\" onclick=\"deleteUser(${actionString})\" class=\"btn btn-danger\">Supprimer les données de l'ESP</button></div></div>`
        }
    }
    // On libère le fait de pouvoir faire d'autres requêtes
    allowed = true;
}

// Permet de supprimer un utilisateur via son adresse
async function deleteUser(espAddress) {
    if (!allowed) return
    allowed = false;

    // On confirme à l'utilisateur la suppression
    if (confirm("Etes vous sûr de supprimer cet ESP ainsi que toutes les données ?") == true) {
        if (espAddress != "" && espAddress != null) {
            try {
                var xhr = new XMLHttpRequest();
                xhr.open("DELETE", "/deleteUser", true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify({ address: espAddress }));
            } catch (err) {
                console.log("Add user request failed because of : ", console.log(err))
            }
        }
        allowed = true;
        retrieveAllUsers()

        return 200;
    } else {
        return
    }
}

// Permet d'ajouter un utilisateur à la base de données
async function addUser() {
    if (!allowed) return
    allowed = false;
    espTemperatureValue = document.getElementById("espTemperatureValue").value
    espAddressValue = document.getElementById("espAddressValue").value

    if (espTemperatureValue != "" && espTemperatureValue != null && espAddressValue != "" && espAddressValue != null) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/addUser", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({ value: espTemperatureValue, address: espAddressValue, date: new Date() }));

        } catch (err) {
            console.log("Add user request failed because of : ", console.log(err))
        }
    }
    allowed = true;
    retrieveAllUsers();
    return 200;
}

// Main
function main() {
    retrieveAllUsers();
}