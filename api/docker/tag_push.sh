#!/usr/bin/env bash

DATE=`date +%Y%m%d_%H%M%S`

# TAG
docker tag studium_api:latest asudre/studium:api_latest
docker tag studium_api:latest asudre/studium:api_${DATE}

# PUSH
docker push asudre/studium:api_${DATE}
docker push asudre/studium:api_latest
