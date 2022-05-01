// Initialisation des variables

//=== Initialisation des traces/charts de la page html ===
// Apply time settings globally
Highcharts.setOptions({
    global: { // https://stackoverflow.com/questions/13077518/highstock-chart-offsets-dates-for-no-reason
        useUTC: false
            // type: 'spline'
    },
    time: { timezone: 'Europe/Paris' }
});

var which_esps = [];
var refreshInterval = 300000;
var currentIntervalId = 0;
retrieveAllEsp();

function modifyRefreshTime() {
    refreshInterval = document.getElementById('timeoutValue').value

    if (!isNaN(refreshInterval)) {
        refreshInterval = (document.getElementById('timeoutValue').value) * 1000;
        console.log("New refresh time is : ", refreshInterval)
        clearInterval(currentIntervalId);

        window.setInterval(get_samples_from_database,
                refreshInterval,
                espList) // param 1 for get_samples_from_database()

    } else {
        alert("Le nombre entré n'est pas un chiffre !")
        return
    }

}

$.ajax({
    url: "/fetchAllUsers",
    type: 'GET',
    headers: { Accept: "application/json", },
    success: function(resultat, statut) {
        setEspList(resultat);
    },
    error: function(resultat, statut, erreur) {
        console.log("Error happened on the fetch all users ajax call : ", erreur)
    }
})

function setEspList(resultat) {
    //=== Gestion de la flotte d'ESP =================================
    var which_esps_mac = []
    var which_esps_ip = []
    var which_esps = resultat

    // Main
    // TODO
    // On récupère toutes les adresses et on les assigne au bon tableau
    // for (var i = 0; i < which_esps.length; i++) {
    //     // countString(which_esps[i].address, ":") > 2
    //     if (which_esps[i].address.includes(":")) {
    //         which_esps_mac.push(which_esps[i]);
    //     } else {
    //         which_esps_ip.push(which_esps[i]);
    //     }
    // }

    process_esp(which_esps, "mac")

    for (var j = 0; j < which_esps_ip.length; i++) {
        // process_esp(which_esps_ip[i], "ip")
    }
}


// cf https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/spline-irregular-time/
var chart1 = new Highcharts.Chart({
    title: { text: 'Temperatures' },
    subtitle: { text: 'Irregular time data in Highcharts JS' },
    credits: false,
    chart: { renderTo: 'container1' },
    xAxis: { title: { text: 'Heure' }, type: 'datetime' },
    yAxis: { title: { text: 'Temperature (Deg C)' } },
    // TODO : On devrait stocker ce genre de choses dans le cloud Atlas, c'est pas beau comme ça (potentiellement point à surligner, persistence des données)
    series: [],
    // { name: 'ESP1', data: [] },
    // TODO : On va limiter à 10 le nombre de machines (sinon génération de couleurs aléatoires, pas ouf ?)
    colors: ['red', 'green', 'blue', 'purple', 'black', 'yellow', 'brown', 'chartreuse', 'aqua', 'crimson'],
    plotOptions: {
        series: {},
        line: {
            dataLabels: { enabled: true },
            enableMouseTracking: true
        }
    }
});

//=== Installation de la periodicite des requetes GET============
function process_esp(espList, typeAdresse) {
    // Adresse IP
    if (typeAdresse == "ip") {
        // Gestion de la temperature
        // premier appel pour eviter de devoir attendre RefreshT
        get_samples_from_esp(which_esps[i]);
    }
    // Adresse MAC
    if (typeAdresse == "mac") {
        // Gestion de la temperature
        // premier appel pour eviter de devoir attendre RefreshT
        get_samples_from_database(espList);

        //calls a function or evaluates an expression at specified
        //intervals (in milliseconds).
        currentIntervalId =
            window.setInterval(get_samples_from_database,
                refreshInterval,
                espList) // param 1 for get_samples_from_database()
    } else {
        return null;
    }
}

//=== Recuperation dans le Node JS server et d'Atlas des samples de l'ESP et 
//=== Alimentation des charts ====================================
//=== Ici on interroge pas l'ESP mais juste une base de données qui contient toutes les valeurs
function get_samples_from_database(espList) {
    // TODO : A commenter
    while (espList.length > 0 && chart1.series.length < 8) {
        try {
            selectedEsp = espList[0].address
            pushedId = []
            selectedEspList = []

            for (var i = 0; i < espList.length; i++) {
                if (espList[i].address == selectedEsp) {
                    selectedEspList.push([Date.parse(espList[i].date), parseFloat(espList[i].value)]);
                    pushedId.push(i)
                }
            }
            alreadyPresent = false

            for (var j = 0; j < pushedId.length; j++) {
                espList.splice(pushedId[i], 1)
            }

            if (selectedEspList.length > 1) {
                for (var p = 0; p < chart1.series.length; p++) {
                    if (selectedEsp == chart1.series.name) {
                        alreadyPresent = true;
                    }
                }

                if (!alreadyPresent) {
                    chart1.addSeries({
                        name: selectedEsp,
                        data: selectedEspList
                    })
                }
            }
        } catch (err) {
            console.log("Ajout de l'esp n'a pas réussi car le format n'est pas le bon : ", err)
        }
        chart1.redraw();

    }
}

// Interrogation via IP TODO dire pk on l'a pas gardé
function get_samples_from_esp(path_on_node, serie) {
    // var tempUrl = "/esp/temp"

    // $.ajax({
    //     url: tempUrl.concat(path_on_node), // URL to "GET" : /esp/temp ou /esp/light
    //     type: 'GET',
    //     headers: { Accept: "application/json", },
    //     success: function(resultat) { // Anonymous function on success
    //         // TODO : Gérer le fait qu'on ne puisse pas avoir plus de 10 données
    //         let listeData = [];
    //         resultat.forEach(function(element) {
    //             listeData.push([Date.parse(element.date), element.value]);
    //             //listeData.push([Date.now(),element.value]);
    //         });
    //         serie.setData(listeData); //serie.redraw();
    //     },
    //     error: function(resultat, statut, erreur) {},
    //     complete: function(resultat, statut) {}
    // });
}


function retrieveAllEsp() {
    $.ajax({
        url: "/fetchAllUsers",
        type: 'GET',
        headers: { Accept: "application/json", },
        success: function(resultat, statut) {
            console.log("result from get : ")
            console.log(resultat[0])
            espResults = resultat.map(res => {
                return {
                    "temp": res.value,
                    "lat": res.lat,
                    "lon": res.lon,
                    "name": res.esp_nb,
                    "city": res.city,
                    "date": new Date(res.date)
                }
            })
            console.log(espResults)
            setEspList(resultat);
            displayMarkers(espResults, true);
        },
        error: function(resultat, statut, erreur) {
            console.log("Error happened on the fetch all users ajax call : ", erreur)
        }
    });
}

function countString(str, letter) {
    let count = 0;

    // looping through the items
    for (let i = 0; i < str.length; i++) {

        // check if the character is at that position
        if (str.charAt(i) == letter) {
            count += 1;
        }
    }
    return count;
}



// PARTIE QUI CONCERNE CE QU HASNAA A FAIT TODO
async function apiCalls(markers) {
    let lat, lon;
    const promises = [];

    // console.log("in apiCalls", markers)
    for (var i = 0; i < markers.length; i++) {
        lat = markers[i].lat;
        lon = markers[i].lon;

        const apiKey = "&appid=940d0f1e4f2294d0c4a9ab486dfd9a52";
        const route = "https://api.openweathermap.org/data/2.5/weather"
        const params = "?units=metric&lat=" + lat + "&lon=" + lon;

        const url = route + params + apiKey;

        // console.log("url to call", url)

        promises.push(apiCall(url)); // Executed about 50 times.
    }
    return Promise.all(promises)
}

async function apiCall(url) {
    console.log("in apiCall")
    return new Promise(resolve => {
        fetch(url)
            .then(function(response) {
                return response.json()
            })
            .then(function(data) {
                var weather = {};
                weather.temp = data.main.temp;
                weather.lat = data.coord.lat;
                weather.lon = data.coord.lon;
                weather.name = data.name;
                weather.date = new Date(Date.now())
                espWeathers.push(weather)
                resolve(true);
            }).catch(() => resolve(false));
    });
}

const markers = [{
        name: 'Canada',
        url: 'https://en.wikipedia.org/wiki/Canada',
        lat: 56.130366,
        lon: -106.346771,
    },
    {
        name: 'Anguilla',
        url: 'https://en.wikipedia.org/wiki/Anguilla',
        lat: 18.220554,
        lon: -63.068615,
    },
    {
        name: 'Barbados',
        url: 'https://en.wikipedia.org/wiki/Barbados',
        lat: 13.193887,
        lon: -59.543198,
    },
    {
        name: 'United States',
        url: 'https://en.wikipedia.org/wiki/United_States',
        lat: 37.09024,
        lon: -95.712891,
    },
    {
        name: 'Ireland',
        url: 'https://en.wikipedia.org/wiki/Ireland',
        lat: 53.41291,
        lon: -8.24389,
    },
    {
        name: 'Scotland',
        url: 'https://en.wikipedia.org/wiki/Scotland',
        lat: 56.490671,
        lon: -4.202646,
    },
    {
        name: 'England',
        url: 'https://en.wikipedia.org/wiki/England',
        lat: 52.355518,
        lon: -1.17432,
    },
    {
        name: 'France',
        url: 'https://en.wikipedia.org/wiki/France',
        lat: 46.227638,
        lon: 2.213749,
    },
    {
        name: 'The Netherlands',
        url: 'https://en.wikipedia.org/wiki/The_Netherlands',
        lat: 52.132633,
        lon: 5.291266,
    },
    {
        name: 'Switzerland',
        url: 'https://en.wikipedia.org/wiki/Switzerland',
        lat: 46.818188,
        lon: 8.227512,
    },
    {
        name: 'South Africa',
        url: 'https://en.wikipedia.org/wiki/South_Africa',
        lat: -30.559482,
        lon: 22.937506,
    },
    {
        name: 'Madagascar',
        url: 'https://en.wikipedia.org/wiki/Madagascar',
        lat: -18.766947,
        lon: 46.869107,
    },
    {
        name: 'Taiwan',
        url: 'https://en.wikipedia.org/wiki/Taiwan',
        lat: 23.69781,
        lon: 120.960515,
    },
    {
        name: 'Japan',
        url: 'https://en.wikipedia.org/wiki/Japan',
        lat: 36.204824,
        lon: 138.252924,
    },
    {
        name: 'Argentina',
        url: 'https://en.wikipedia.org/wiki/Argentina',
        lat: -38.416096,
        lon: -63.616673,
    },
];
computeWeather(markers);

const espWeathers = [];

const myURL = jQuery('script[src$="charts.js"]')
    .attr('src')
    .replace('charts.js', '')

const myIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
    iconRetinaUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
    iconSize: [29, 24],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14],
})

function computeWeather(markers) {
    // console.log("calling apiCalls", markers)
    apiCalls(markers).then(() => {
        displayMarkers(espWeathers)
    });
}

function displayMarkers(markers, defaultIcon = false) {
    for (var i = 0; i < markers.length; ++i) {
        L.marker([Number(markers[i].lat), Number(markers[i].lon)], defaultIcon ? { icon: myIcon } : {})
            .bindPopup(
                '<a target="_blank">' +
                markers[i].name + " : " + markers[i].temp + " °C" +
                '</a>'
            )
            .addTo(map)

    }
}