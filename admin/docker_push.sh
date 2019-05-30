#!/usr/bin/env bash

# LOGIN
docker login -u ${DOCKER_HUB_LOGIN} -p ${DOCKER_HUB_PASSWORD}

DATE=`date +%Y%m%d_%H%M%S`
VERSION='0.0.2'

# TAG
docker tag studium/admin:latest studium/admin:latest
docker tag studium/admin:latest studium/admin:${VERSION}

# PUSH
docker push studium/admin:${VERSION}
docker push studium/admin:latest

# LOGOUT
docker logout
