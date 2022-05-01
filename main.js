// Imports
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const mqtt = require('mqtt');
const { redirect } = require('express/lib/response');
var accessAllowed = false;

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

// APP CONFIGURATION
app.use(require("cors")()); // Accepte les requêtes inter domaines
app.use(require("body-parser").json()); // Parse automatiquement les JSON des requêtes
app.use("/src", express.static(path.join(__dirname, '/src/'))); // Permet d'utiliser les scripts dans henoku

// Main
mqttInit()

// Routes
app.get('/', (req, res) => {
    if (accessAllowed) {
        res.sendFile(path.join(__dirname, '/index.html'), { acceptRanges: false })
    } else {
        res.sendFile(path.join(__dirname, '/login.html'), { acceptRanges: false })
    }
});

app.get('/home', (req, res) => {
    console.log("Access allowed value :", accessAllowed)
    if (!accessAllowed) {
        console.log("On redirige vers login")
        res.sendFile(path.join(__dirname, '/login.html'), { acceptRanges: false })
    } else {
        console.log("On redirige vers l'accueil")
        res.sendFile(path.join(__dirname, '/index.html'), { acceptRanges: false });
    }
})

app.post("/confirmUserAuthentication", async(req, res) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    // On compte le nombre de requêtes qu'on a trouvé
    try {
        await client.connect();
        const collection = client.db("weather_map").collection("users");
        requestPassword = req.body.password;
        requesLogin = req.body.login;

        const query = { login: requesLogin, password: requestPassword }

        const resultCount = await collection.countDocuments(query);
        console.log(`Number of user fetched : ${resultCount}`);

        if (resultCount > 0) {
            console.log("Authentication success !");
            // On fait une fonction ici pour pouvoir modifier la variable de façon globale
            setAccessAllowed();
            res.redirect("/home");
            // TODO : PB ici
            console.log("Access allowed value :", accessAllowed)
        } else {
            // TODO : l'afficher sur la page
            console.log("Authentication failed, please retry");
        }
    } catch (err) {
        console.log(err)
    }
});

app.get("/fetchUser", async(req, res) => {
    if (!accessAllowed) {
        return
    }
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    // On compte le nombre de requêtes qu'on a trouvé
    try {
        await client.connect();
        const collection = client.db("weather_map").collection("esp_list");
        var query = null
        if (req.params.name == "propertyName") {
            query = { "espName": req.params.espName }
        } else {
            query = { "espAddress": req.params.espName }
        }

        const resultCount = collection.countDocuments(query);
        console.log(`Number of result fetched : ${resultCount}`);

        if (resultCount > 0) {
            // Traitement de l'objet trouvé
            var cursor = collection.find(query)
            var cursorToArray = await cursor.toArray()

            console.log("Résultat : ", cursorToArray)
            console.log("Type de cursorarray : ", typeof cursorToArray)
            console.log("Type de cursorarray : ", cursorToArray[0].nom)

            return cursorToArray;
        }
    } finally {
        await client.close();
    }
    return res.status(500);
});

app.delete("/deleteUser", async(req, res) => {
    if (!accessAllowed) {
        return
    }

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    console.log("Address : ", req.body.address)

    if (req.body.address == "" | req.body.address == null) {
        return res.status = 500;
    }

    try {
        await client.connect();
        const collection = client.db("weather_map").collection("esp_list");
        var query = { address: req.body.address }
        console.log("Query is :", query)

        const deleteResult = await collection.deleteMany(query);
        console.log(deleteResult.deletedCount)
        if (deleteResult.deletedCount === 1) {
            console.log("Le document a bien été supprimé !");
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

app.get("/fetchAllUsers", async(req, res) => {
    if (!accessAllowed) {
        return
    }

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    // On compte le nombre de requêtes qu'on a trouvé
    try {
        await client.connect();
        const collection = client.db("weather_map").collection("esp_list");

        const resultCount = await collection.countDocuments();
        console.log(`Number of result fetched : ${resultCount}`);

        if (resultCount > 0) {
            // Traitement de l'objet trouvé
            var cursor = collection.find()
            var cursorToArray = await cursor.toArray()

            // console.log("Résultat : ", cursorToArray)

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

app.post("/addUser", async(req, res) => {
    if (!accessAllowed) {
        return
    }

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    if (req.body.value == "" | req.body.value == null | req.body.address == "" | req.body.address == null) {
        return res.status = 500;
    }

    try {
        await client.connect();
        const collection = client.db("weather_map").collection("esp_list");
        var now = new Date();

        var value = parseFloat(req.body.value);
        console.log("Type of value : ", typeof value)
        console.log(value)

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

app.listen(port, async() => {
    console.log(`App running on localhost, port : ${port}!`)

    // try {
    //     await client.connect();
    //     const collection = client.db("weather_map").collection("esp_list");

    //     // Permet de savoir la taille estimée de la BDD
    //     const estimate = await collection.estimatedDocumentCount();
    //     console.log(`Estimated number of documents in the collection: ${estimate}`);

    //     // Query de test pour voir si on peut fetch
    //     const query = { "nom": "test" };

    //     // On compte le nombre de requêtes qu'on a trouvé
    //     const countCanada = await collection.countDocuments(query);
    //     console.log(`Number of result fetched : ${countCanada}`);

    //     if (countCanada > 0) {
    //         // Traitement de l'objet trouvé
    //         var cursor = collection.find(query)
    //         var cursorArray = await cursor.toArray()

    //         console.log("Résultat : ", cursorArray)
    //         console.log("Type de cursorarray : ", typeof cursorArray)
    //         console.log("Type de cursorarray : ", cursorArray[0].nom)
    //     }

    //     // Ajout d'un document
    //     const insertQuery = {
    //         nom: "NODEJS",
    //         adresse: "localhost",
    //     }

    //     const insertResult = await collection.insertOne(insertQuery);
    //     console.log(`Un document a été inséré avec l'id : ${insertResult.insertedId}`);

    //     // Suppression de document
    //     const deleteResult = await collection.deleteOne(insertQuery);
    //     if (deleteResult.deletedCount === 1) {
    //         console.log("Le document a bien été supprimé !");
    //     } else {
    //         console.log("Aucun document n'a été trouvé avec cette query, 0 document ont été supprimé.");
    //     }

    // } finally {
    //     await client.close();
    // }
});

// Functions
async function addUserData(jsonData) {
    console.log("Json data content : ", jsonData)
    try {
        const who = jsonData.info.ident; // MAC
        const value = jsonData.status.temperature; // TEMPERATURE
        const location = jsonData.info.loc; // LOCATION (lat + long)
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    } catch (err) {
        console.log("Add user data failed because of : ", err.message)
        return null
    }

    if (who == "" | who == null | value == "" | value == null | location == null | location == "") {
        return null;
    }

    try {
        await client.connect();
        const collection = client.db("weather_map").collection("esp_list");
        // On compte le nombre de données déjà présentes
        const countQuery = { "address": who };
        const countUser = await collection.countDocuments(countQuery);

        // Si on a plus de 10 données, on enlève les précédentes
        if (countUser > 5) {
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

        var now = new Date();
        var latLonSplit = location.split(";")
        var lon = latLonSplit[0]
        var lat = latLonSplit[1]

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

function mqttInit() {
    const client = mqtt.connect('mqtt://test.mosquitto.org', mqttOptions)

    client.on('connect', function() {
        client.subscribe('sensors/temp', function(err) {})
    })

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

function setAccessAllowed() {
    accessAllowed = true;
}