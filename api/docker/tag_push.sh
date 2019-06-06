#!/usr/bin/env bash

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

DATE=`date +%Y%m%d_%H%M%S`

# LOGIN
docker login -u ${DOCKER_HUB_LOGIN} -p ${DOCKER_HUB_PASSWORD}

# TAG
docker tag studium/api:latest studium/api:latest
docker tag studium/api:latest studium/api:${PACKAGE_VERSION}
docker tag studium/api:latest studium/api:${DATE}

# PUSH
docker push studium/api:latest
docker push studium/api:${PACKAGE_VERSION}
docker push studium/api:${DATE}

# LOGOUT
docker logout
