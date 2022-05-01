// Imports
const express = require('express');
const path = require('path');
const mqtt = require('mqtt');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { redirect } = require('express/lib/response');

// Déclarations
const app = express();
const port = process.env.PORT || 3000;;
const uri = "mongodb+srv://thomasdelmare:thomasdelmare@cluster0.hotx2.mongodb.net/weather_map?retryWrites=true&w=majority";
const mqttOptions = {
    // Clean session
    clean: true,
    connectTimeout: 4000,
    // Auth
    clientId: 'tdmshe'
}
var accessAllowed = false;

// APP CONFIGURATION
app.use(require("cors")()); // Accepte les requêtes inter domaines
app.use(require("body-parser").json()); // Parse automatiquement les JSON des requêtes
app.use("/src", express.static(path.join(__dirname, '/src/'))); // Permet d'utiliser les scripts dans henoku

// Main
main()

// Routes

// Route redirigeant vers la page de connexion
app.get('/', (req, res) => {
    // Si l'utilisateur ne s'est pas identifié, il ne doit pas avoir accès à la page d'accueil
    if (accessAllowed) {
        res.sendFile(path.join(__dirname, '/index.html'), { acceptRanges: false })
    } else {
        res.sendFile(path.join(__dirname, '/src/views/login.html'), { acceptRanges: false })
    }
});

// Route redirigeant vers la page d'accueil
app.get('/home', (req, res) => {
    // Si l'utilisateur ne s'est pas identifié, il ne doit pas avoir accès à la page d'accueil
    if (!accessAllowed) {
        res.sendFile(path.join(__dirname, '/src/views/login.html'), { acceptRanges: false })
    } else {
        res.sendFile(path.join(__dirname, '/index.html'), { acceptRanges: false });
    }
})

// Route permettant de 
app.post("/confirmUserAuthentication", async(req, res) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();
        const collection = client.db("weather_map").collection("users");
        requestPassword = req.body.password;
        requesLogin = req.body.login;

        const query = { login: requesLogin, password: requestPassword };

        // On compte le nombre de requêtes qu'on a trouvé
        const resultCount = await collection.countDocuments(query);
        console.log(`Number of user fetched : ${resultCount}`);

        // On n'a trouvé une combinaison identifiant et mot de passe valide
        if (resultCount > 0) {
            console.log("Authentication success !");
            // On fait une fonction ici pour pouvoir modifier la variable de façon globale
            setAccessAllowed();
            // On redirige vers la route /home afin que l'utilisateur puisse être mis sur la bonne page
            res.redirect("/home");
        } else {
            res.redirect("/")
            console.log("Authentication failed, please retry");
        }
    } catch (err) {
        console.log(err)
    }
});

// Route permettant de supprimer un utilisateur
app.delete("/deleteUser", async(req, res) => {
    // On ne doit pas permettre à l'utilisateur de supprimer des données s'il n'est pas connecté
    if (!accessAllowed) return

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    if (req.body.address == "" | req.body.address == null) {
        return res.status = 500;
    }

    try {
        await client.connect();
        const collection = client.db("weather_map").collection("esp_list");
        var query = { address: req.body.address }

        // On supprime autant d'entrées que possible
        const deleteResult = await collection.deleteMany(query);

        if (deleteResult.deletedCount === 1) {
            console.log("Le document a bien été supprimé ! ", deleteResult.deletedCount, " occurences ont été supprimées !");
            return res.status(200)
        } else {
            console.log("Aucun document n'a été trouvé avec cette query, 0 document ont été supprimé.");
            return res.status(500)
        }
    } catch (err) {
        console.log("Delete failed because of : ", console.log(err))
    } finally {
        await client.close();
    }

    return res.status(500)
});

// Route permettant de récupérer tous les utilisateurs
app.get("/fetchAllUsers", async(req, res) => {
    if (!accessAllowed) return

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();
        const collection = client.db("weather_map").collection("esp_list");

        // On compte le nombre de requêtes qu'on a trouvé
        const resultCount = await collection.countDocuments();
        console.log(`Number of result fetched : ${resultCount}`);

        if (resultCount > 0) {
            // Traitement de l'objet trouvé
            var cursor = collection.find()
            var cursorToArray = await cursor.toArray() // On le transforme en array pour pouvoir manipuler plus facilement l'objet
            return res.json(cursorToArray);
        }
    } catch (err) {
        console.log("Fetch all users failed because of : ", console.log(err))
        client.close();
    } finally {
        await client.close();
    }
    return res.status(500);
});

// Route permettant d'ajouter un utilisateur à la base de données
app.post("/addUser", async(req, res) => {
    if (!accessAllowed) return

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    // On vérifie que les données envoyées sont exploitables
    if (req.body.value == "" | req.body.value == null | req.body.address == "" | req.body.address == null) {
        return res.status = 500;
    }

    try {
        await client.connect();
        const collection = client.db("weather_map").collection("esp_list");
        var now = new Date(); // On met la date de reçu de la requête
        var value = parseFloat(req.body.value);

        if (value != NaN) {
            const insertQuery = {
                value: value,
                address: req.body.address,
                date: now
            }

            const insertResult = await collection.insertOne(insertQuery);
            console.log(`Un document a été inséré avec l'id : ${insertResult.insertedId}`);

            return res.status(200);
        } else {
            console.log("Adding of the user failed because the temperature is not a number.")
        }

    } catch (err) {
        console.log("Error because of : ", err)
        await client.close();
        return res.status(500);
    } finally {
        await client.close();
    }
});

// Main route, permettant de démarrer le projet et de notifier l'utilisateur que le projet a bien démarré
app.listen(port, async() => {
    console.log(`App running on localhost, port : ${port}!`)
});

// Functions

// Permet d'ajouter toutes les données de l'utilisateur en BDD
async function addUserData(jsonData) {
    // Vous pouvez décommenter afin d'aficher le contenu de la variable JSON qui est arrivée
    console.log("Json data content : ", jsonData)

    var who = ""; // MAC
    var value = ""; // TEMPERATURE
    var location = "" // LOCATION (lat + long)
    var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    // On met dans un try catch dans le cas où les données ne seraient pas présentes ou que le parse se passe mal
    try {
        who = jsonData.info.ident; // MAC
        value = jsonData.status.temperature; // TEMPERATURE
        location = jsonData.info.loc; // LOCATION (lat + long)
        if (typeof location != "object") {
            lat = parsingLocation(location)[0];
            lon = parsingLocation(location)[1];
            if (lat.isArray()) {
                lat = lat[0]
            }
            if (lon.isArray()) {
                lon = lon[0]
            }
        } else {
            lat = location.lat
            lon = location.lgn
        }
        console.log("Lat value : ", lat)
        console.log("Lon value : ", lon)
    } catch (err) {
        console.log("Add user data failed because of : ", err.message)
        return null
    }

    // On vérifie que les données soient exploitables
    if (who == "" | who == null | value == "" | value == null | lat == null | lat == "" | lon == null | lon == "") {
        return null;
    }

    try {
        await client.connect();
        const collection = client.db("weather_map").collection("esp_list");

        // On compte le nombre de données déjà présentes
        const countQuery = { "address": who };
        const countUser = await collection.countDocuments(countQuery);

        // Si on a plus de 10 données, on enlève les précédentes
        if (countUser > 10) {
            // Traitement de l'objet trouvé
            var cursor = collection.find(countQuery)
            var oldestOne = new Date();
            var cursorToArray = await cursor.toArray()

            for (var i = 0; i < cursorToArray.length; i++) {
                if (cursorToArray[i].date < oldestOne) {
                    oldestOne = cursorToArray[i]
                }
            }

            var deleteQuery = { address: oldestOne.address, value: oldestOne.value, date: oldestOne.date }

            try {
                const deleteResult = await collection.deleteOne(deleteQuery);
                console.log(deleteResult.deletedCount)
                if (deleteResult.deletedCount === 1) {
                    console.log("Le document a bien été supprimé !");
                } else {
                    console.log("Aucun document n'a été trouvé avec cette query, 0 document ont été supprimé.");
                }
            } catch (err) {
                console.log("Delete failed because of : ", console.log(err))
            }
        }

        // On s'occupe maintenant de l'insertion en BDD
        var now = new Date();
        const insertQuery = {
            address: who,
            value: value,
            date: now,
            lon: lon,
            lat: lat
        }

        const insertResult = await collection.insertOne(insertQuery);
        console.log(`Un document a été inséré avec l'id : ${insertResult.insertedId}`);

        return true;
    } catch (err) {
        console.log("Error because of : ", err)
        await client.close();
        return null;
    } finally {
        await client.close();
    }
}

// Permet d'initialiser toutes les données liées à MQTT
function mqttInit() {
    const client = mqtt.connect('mqtt://test.mosquitto.org', mqttOptions)

    // On subscribe au topic 
    client.on('connect', function() {
        client.subscribe('iot/M1Miage2022', function(err) {})
    })

    // A chaque reçu de message, on essaye de parser le contenu et on affiche dans la console
    client.on('message', function(topic, message) {
        // message is Buffer
        try {
            jsonObject = JSON.parse(message)
            addUserData(jsonObject);
            // console.log("Topic is : ", topic, " and message content is : ", message.toString())
        } catch (err) {
            console.log("Error because of : ", err.message)
        }
    })
}

// Permet de changer l'état de la variable globale d'accès au page, on ne peut pas changer le contenu d'une variable globale depuis les routes
function setAccessAllowed() {
    accessAllowed = true;
}

// Fonction permettant d'essayer le parsing des données de location
// Vu que les donneés à renvoyer n'étaient pas claires, nous avons décidé de gérer le cas où la variable "location" est un json ou un string
// d'une certaine forme.
function parsingLocation(locationStringOrJson) {
    parsing = []

    // if(typeof locationStringOrJson == )

    try {
        // Avec l'exemple '{"lat":43.71164703,"lgn":7.282168388}'

        // On isole la latitude
        lat = locationStringOrJson.split(":");
        latText = lat[1] // Renverra 43.71164703,"lgn":7.282168388}'
        lat = latText.split(",")
        latText = lat[0] // Renverra 43.71164703
        parsing.push(latText)

        // On isole la longitude
        lgn = locationStringOrJson.split(":");
        lgnText = lgn[2] // Renverra 43.71164703,"lgn":7.282168388}'
        lgn = lgnText.split("}")
        lgnText = lgn[0] // Renverra 7.282168388
        parsing.push(lgnText)

        return parsing;
    } catch {
        console.log("Tried to parse location from string and failed")
    }
    try {
        parsed = JSON.parse(locationStringOrJson);
        parsing.push(parsed.lat, parsed.lgn);
        return parsing;
    } catch {
        console.log("Tried to parse location from Json and failed.")
    }

    return null;
}

// Main
function main() {
    mqttInit();
}