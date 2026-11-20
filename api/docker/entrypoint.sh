#!/bin/sh
set -e

# Log des variables d'environnement au demarrage des conteneurs api / worker.
# Le runtime "worker" est construit depuis l'etape "worker" du meme
# Dockerfile (CMD node worker.js) : le prefixe du log s'adapte a la commande.
case "$*" in
    *worker.js*) tag="worker" ;;
    *)           tag="api" ;;
esac

log() {
    printf '[%s]   %-25s = %s\n' "$tag" "$1" "${2:-<non definit>}"
}

echo "[$tag] Variables d'environnement au demarrage :"
log NODE_ENV                   "$NODE_ENV"
log APP_MODE                   "$APP_MODE"
log MONGODB_CONNECTION_STRING  "$MONGODB_CONNECTION_STRING"
log MONGO_URL                  "$MONGO_URL"
log WORKER_POLL_INTERVAL_MS    "$WORKER_POLL_INTERVAL_MS"
log WORKER_HEARTBEAT_MS        "$WORKER_HEARTBEAT_MS"
log WORKER_STALE_MS            "$WORKER_STALE_MS"
log BACKUP_DIR                 "$BACKUP_DIR"

# Relance l'entrypoint d'origine de l'image node (docker-entrypoint.sh,
# qui se contente de faire "exec $@"), puis la commande du conteneur.
if [ -x /usr/local/bin/docker-entrypoint.sh ]; then
    exec /usr/local/bin/docker-entrypoint.sh "$@"
fi

exec "$@"
