# Studium

Studium is a rich web application that allow to browse and request prosopographics data via a complete API.


## API Documentation :
https://app.swaggerhub.com/apis-docs/studium/StudiumAPI/0.0.3


## Components

admin   : basic web interface
batch   : core function designed to process RAW data
api     : REST API to interact with Mongo Database
scripts : some scripts for MongoDb

## Requirement

PHP 7+
NodeJS 12+
MongoDB 3+

## Installation de l'environnement
1) Installer MongoDB
2) Dans un terminal, rendez-vous dans le dossir batch. Lancer npm i
3) Créer un admin dans la base :  npm start -- create-admin
4) Dans le dossier api Lancer npm i
5) Lancer npm start --> api dispo sur http://localhost:3000
6) Dans admin lancer bin/start.sh (ou bin/start.bat sous windows) --> ihm dispo sur http://localhost:8000


## Licence
Studium is Open Source
