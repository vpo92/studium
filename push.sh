#!/bin/sh

cd api
npm -q run docker:push

cd ../web
npm -q run docker:push

cd ../admin
./docker_push.sh
