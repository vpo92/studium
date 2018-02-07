#!/usr/bin/env bash

DATE=`date +%Y%m%d_%H%M%S`

# LOGIN
docker login -u ${DOCKER_HUB_LOGIN} -p ${DOCKER_HUB_PASSWORD}

# TAG
docker tag studium/api:latest studium/api/latest
docker tag studium/api:latest studium/api/${DATE}

# PUSH
docker push studium/api:${DATE}
docker push studium/api:latest

# LOGOUT
docker logout
