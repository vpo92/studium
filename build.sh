#!/bin/sh
npm i -g webpack
npm i
cd api
npm run docker:build
cd ../web
npm run docker:build
