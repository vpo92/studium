#!/bin/sh
set -e

# Log des variables d'environnement au démarrage du conteneur admin.
echo "[admin] Variables d'environnement au demarrage :"
echo "[admin]   APPLICATION_URL = ${APPLICATION_URL:-<non definit>}"
echo "[admin]   PUBLIC_API_URL  = ${PUBLIC_API_URL:-<non definit>}"
echo "[admin]   API_URL         = ${API_URL:-<non definit>}"

# Relance l'entrypoint d'origine de l'image php:apache (docker-entrypoint.sh
# se contente de faire "exec $@"), puis la commande du conteneur.
if [ -x /usr/local/bin/docker-entrypoint.sh ]; then
    exec /usr/local/bin/docker-entrypoint.sh "$@"
fi

exec "$@"
