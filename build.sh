#!/bin/sh
npm i -g webpack
npm i
cd api
npm i
npm run docker:build
cd ../web
npm i
npm run docker:build
