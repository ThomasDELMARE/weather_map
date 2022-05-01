let allowed = true;
retrieveAllUsers();

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

async function retrieveAllUsers() {
    if (!allowed) return
    allowed = false;

    var currentUsers = await fetch('/fetchAllUsers')
        .then(function(response) {
            return response.json()
        })
        .then(function(responseJson) {
            return responseJson
        })

    document.getElementById("espList").innerHTML = null
    knownUsers = []

    for (let i = 0; i < currentUsers.length; i++) {
        // On ajoute à une liste pour éviter de répéter plusieurs fois la même adresse
        if (!knownUsers.includes(currentUsers[i].address)) {
            knownUsers.push(currentUsers[i].address)
            actionString = "'" + currentUsers[i].value + "', '" + currentUsers[i].address + "'"
                // document.getElementById("espList").innerHTML += "<ul class='list-group list-group-horizontal'><li class='list-group-item'>" + currentUsers[i].address + `</li><button type=\"button\" onclick=\"deleteUser(${actionString})\" class=\"btn btn-danger\">Supprimer les données de l'ESP</button></ul>`
            document.getElementById("espList").innerHTML += "<div class='row list-group list-group-horizontal'><div class='col list-group-item'>" + currentUsers[i].address + `</div><div class="col"><button type=\"button\" onclick=\"deleteUser(${actionString})\" class=\"btn btn-danger\">Supprimer les données de l'ESP</button></div></div>`
        }
    }
    allowed = true;
}

async function deleteUser(espName, espAddress) {
    if (!allowed) return
    allowed = false;

    if (confirm("Etes vous sûr de supprimer cet ESP ainsi que toutes les données ?") == true) {
        console.log("TEST")
        if (espName != "" && espName != null && espAddress != "" && espAddress != null) {
            try {
                var xhr = new XMLHttpRequest();
                xhr.open("DELETE", "/deleteUser", true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify({ name: espName, address: espAddress }));
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

async function addUser() {
    if (!allowed) return
    allowed = false;
    console.log("On envoie la requete de post")
    espTemperatureValue = document.getElementById("espTemperatureValue").value
    espAddressValue = document.getElementById("espAddressValue").value

    console.log(espTemperatureValue)
    console.log(espAddressValue)

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