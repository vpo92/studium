#!/usr/bin/env bash

# LOGIN
docker login -u ${DOCKER_HUB_LOGIN} -p ${DOCKER_HUB_PASSWORD}

DATE=`date +%Y%m%d_%H%M%S`

# TAG
docker tag studium/web:latest studium/web:latest
docker tag studium/web:latest studium/web:${DATE}

# PUSH
docker push studium/web:${DATE}
docker push studium/web:latest

# LOGOUT
docker logout
