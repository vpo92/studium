#!/bin/sh

export APPLICATION_URL="https://dev.vincentpoupet.fr/proxy/8000/"
export PUBLIC_API_URL="https://dev.vincentpoupet.fr/proxy/3000/"

export API_URL="http://localhost:3000"

open http://0.0.0.0:8000
php -S 0.0.0.0:8000 router.php

