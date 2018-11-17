#!/bin/sh
npm i -q -g webpack
npm i -q
cd api
npm i -q
npm -q run docker:build
cd ../web
npm i -q
npm -q run docker:build
