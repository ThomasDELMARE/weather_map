# READ ME - IOT

<h1>Présentation du projet: </h1>

<h2>Intérêt du projet</h2>
L'interêt de ce projet est de récupérer un ensemble d'ESP présent dans le cloud et leur données telles que celles contenues dans l'API openweather (longitude, latitude), mais aussi toutes celles présentes dans notre base de données MongoDB Atlas (Adresses mac, températures, dates et les utilisateurs). Une fois ces données recupérées, on affiche celles d'openweather et celles de notre BDD sur une map monde et celles de notre BDD sur un graphe d'évolution de la température.
<br>
<br>
<div align="center">
  <img src="https://media.giphy.com/media/NHqKX3CDFPZ8pq07gt/giphy.gif"/>
</div>

<h2> Particularités du projet</h2> 
<h3>Wifi</h3>
Ne pas oublier d'ajouter son propre wifi dans le fichier classic_setup de la manière suivante
  wifiMulti.addAP("nomBox", "mdpBox");
<h3>MQTT</h3>
Pour que MQTT obtienne les données que nous lui envoyons via arduino nous avons procéder de 2 manières
    - La première étant d'essayer de parser la requete via la librairie Javascript JSON Parse
    - La seconde étant d'extraire la longitude et latitude présentes dans notre requête

<h2>Présentation graphe</h2>

Notre graphe de température est un graphe en lignes. Chaque lignes affichée correspond à  l'ensemble des adresses mac ayant au moins renvoyées 2 valeurs de température. On peut donc trouver en abscisse la date à laquelle la valeur a été envoyée et en ordonée la température renvoyée par l'adresse mac. De plus, ces données sont rafraichit dès qu'une nouvelle donnée a été envoyée.
            <div align="center">
  <img src="https://media.giphy.com/media/B2PZG4WnQxmjJCrSzc/giphy.gif"/>
</div>

<h2>Présentation map</h2>

Notre map monde permet d'afficher tous les points gps de chaque ESP qui nous a été renvoyé sur openweather. 
  <div align="center">
  <img src="https://media.giphy.com/media/HrumwrAW8rPl7A884I/giphy.gif"/>
</div>

<h2>Formulaire d'ajout d'une ESP</h2>
L'intérêt de notre formulaire est de rajouter manuellement une ESP dans la base de données ainsi que sur notre graphique et map, qui ne seraient au préalable pas présente dans nos BDD.<br><br>
<div align="center">
  <img src="https://media.giphy.com/media/ciJ0ATYyr0MPDqPhkw/giphy.gif"/>
</div>

<h2> Différence des pins</h2>
Sur notre map nous pouvons trouver 2 types de pins: 
Les bleus correspondent aux données tirées de weathermap et les rouges correspondant à nos ESPs.<br><br>
<div align="center">
  <img src="https://media.giphy.com/media/m08EAlc00qmq2jtJwT/giphy.gif"/>
</div>

<h1>Sécurité</h1>
Nous avons décidé d'ajouter une authentification pour plus de sécurité au sein du projet. 
1 utilisateur est disponible dans notre bases de données : 
    <br>- Identifiant : menez    
    <br>- Mot de passe : menez 2022
 
Lors de l'authentification, nous allons vérifier si la combinaison utilisateur/mot de passe existe dans notre base de données, si c'est le cas, on affiche notre page d'accueil, sinon on réaffiche la page d'authentification.
  <div align="center">
  <img src="https://media.giphy.com/media/igVNBwboTdEps398QO/giphy.gif"/>
</div>

<h1>Point remarquable - Gestion des erreurs de format</h1>

Afin de pallier aux potentiels mauvais formats de la donnée "location" nous avons fait en sorte de gérer deux types de format : JSON et String.

Nous avons pris en compte que le séparateur pouvait être ":" pour le format String et que la donnée "location" pouvait être au format JSON. 

On pourrait très facilement ajouter un autre séparateur ";".

```javascript
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
        // On essaye de parser avec le format JSON pris en compte par Javascript
        parsed = JSON.parse(locationStringOrJson);
        parsing.push(parsed.lat, parsed.lgn);
        return parsing;
    } catch {
        console.log("Tried to parse location from Json and failed.")
    }

    return null;
}
```
