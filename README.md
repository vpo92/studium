# Studium

Studium is a rich web application that allow to browse and request prosopographics data via a complete API.

## API Documentation :
https://app.swaggerhub.com/apis-docs/studium/StudiumAPI/0.0.3

## API
./api -> nodejs API

## PARSER
./batchs -> nodejs utility class to convert raw prosopography to JSON prosopography

## WEB SITE
./admin -> PHP 7 website to interact with the API

## CLI
./cli -> nodejs cli to interact with the API

## Launch in local
- `npm install`

### web application
- `cd web`
- `npm start`

### server api
- `cd api`
- `npm start`

## Docker
### Build
#### Build web app
- `cd web`
- `npm run docker:build`

#### Build server api
- `cd api`
- `npm run docker:build`

#### Build all
- go to project root folder
- `./build.sh`

#### Push image to docker hub
- export DOCKER_HUB_LOGIN='LOGIN'
- export DOCKER_HUB_PASSWORD='PASSWORD'
- `./push.sh`

### Run
#### Run Web app with docker
- `cd web/docker`
- `docker run`

#### Run server api with docker
- `cd api/docker`
- `docker-compose up`

*By default mongodb stores its data in `api/docker/data/db`*

#### Run app with docker
- `docker-compose up`

## Licence
Studium is Open Source

TODO : add license informations
