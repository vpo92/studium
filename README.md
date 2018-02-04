# Studium

Studium is a rich web application that allow to browse and request prosopographics data.

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
