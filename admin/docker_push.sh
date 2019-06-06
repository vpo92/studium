#!/usr/bin/env bash

# LOGIN
docker login -u ${DOCKER_HUB_LOGIN} -p ${DOCKER_HUB_PASSWORD}

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

DATE=`date +%Y%m%d_%H%M%S`

# TAG
docker tag studium/admin:latest studium/admin:latest
docker tag studium/admin:latest studium/admin:${PACKAGE_VERSION}

# PUSH
docker push studium/admin:${PACKAGE_VERSION}
docker push studium/admin:latest

# LOGOUT
docker logout
