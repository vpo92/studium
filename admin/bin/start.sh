#!/bin/sh

export APPLICATION_URL="http://localhost:8000"
open http://localhost:8000
php -S localhost:8000 router.php
