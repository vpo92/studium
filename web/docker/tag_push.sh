#!/usr/bin/env bash

DATE=`date +%Y%m%d_%H%M%S`

# TAG
docker tag studium_public:latest asudre/studium:public_latest
docker tag studium_public:latest asudre/studium:public_${DATE}

# PUSH
docker push asudre/studium:public_${DATE}
docker push asudre/studium:public_latest
