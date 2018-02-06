#!/bin/sh
npm i
cd api
npm run docker:build
cd ../web
npm run docker:build
