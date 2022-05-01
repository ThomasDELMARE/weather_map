# READ ME - IOT

<h1>Présentation du projet: </h1>

<h2>Intérêt du projet : </h2>
L'interêt de ce projet est de recuperer un ensemble d'ESP présentent dans le cloud et leur données telles que celles contenuent dans la base de données open openweather (longitude, latitude), mais aussi toutes celles présentent dans la base de données mongo (adresse mac, temperature, date, users). Une fois ces données recupérées, on les affiches celles d'openweather sur une map monde et celles de mongo sur un graphe d'évolution de la temperature.

<div align="center">
  <img src="https://media.giphy.com/media/NHqKX3CDFPZ8pq07gt/giphy.gif"/>
</div>

<h2> Particularités du projet : </h2> 
<h3>Wifi:</h3>
Ne pas oublier d'ajouter son propre wifi dans le fichier classic_setup de la maniere suivante
  wifiMulti.addAP("nomBox", "mdpBox");
<h3>MQTT:</h3>
Pour que MQTT obtient les données que nous lui envoyer via arduino nous avons procéder de 2 manieres
    - La premiere etant d'essayer de parse la requete via la librairie Json Parse
    - La seconde etant d'extraire la longitude et latitude présente dans notre requête

<h2>Présentation graphe: </h2>

Notre graphe de température est un graphe en lignes. Chaque lignes affichées correspondent à  l'ensemble des adresses mac ayant au moins renvoyées 2 valeurs de temperature. On peut donc trouver en abscisses la date à la quelle la valeur a été envoyée, et en ordonées la temperature renvoyée par l'adresse mac. De plus, ces données sont rafraichit des qu'une nouvelle données a été envoyée.
            <div align="center">
  <img src="https://media.giphy.com/media/B2PZG4WnQxmjJCrSzc/giphy.gif"/>
</div>

<h2>Présentation map: </h2>

Notre map monde permet d'afficher tous les points gps de chaque ESP qui nous a été renvoyé sur openweather. 
  <div align="center">
  <img src="https://media.giphy.com/media/HrumwrAW8rPl7A884I/giphy.gif"/>
</div>

<h2>Formulaire d'ajout d'une ESP: </h2>
L'intérêt de notre formulaire est de rajouter manuellement une ESP dans la base de données et donc sur notre graphe et map qui ne serait au prealable pas présente dans nos BDD. 
<div align="center">
  <img src="https://media.giphy.com/media/ciJ0ATYyr0MPDqPhkw/giphy.gif"/>
</div>

<h2> Différences des pins: </h2>
Sur notre map nous pouvons trouver 2 types de pins: 
Les bleus correspondent à weathermap et les rouges correspondent aux ESP.
<div align="center">
  <img src="https://media.giphy.com/media/m08EAlc00qmq2jtJwT/giphy.gif"/>
</div>

<h1>Point remarquable du projet - Authentification: </h1>
Nous avons decider d'ajouter une authentification pour plus de sécutité au sein du projet. 
1 utilisateur est disponible dans notre bases de données : 
    - login: menez    
    - mot de passe: menez 2022
 
Lors de l'authentification, nous allons verifier si les utilisateurs mot de passes sont existant dans notre base de données si oui alors on affiche notre page d'accueil si non on reload la page d'authentification.
  <div align="center">
  <img src="https://media.giphy.com/media/NuFuL7BuqZ5OVnzZyj/giphy.gif"/>
</div>
