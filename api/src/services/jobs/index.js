// @flow
/**
 * Registre des traitements longs disponibles.
 *
 * Pour ajouter un traitement :
 *   1. créer un fichier `xxxJob.js` exportant
 *      `{ type, label, description, run(ctx) }` ;
 *   2. l'importer ci-dessous et l'ajouter à `handlers`.
 *
 * Rien d'autre à modifier : l'API expose automatiquement le type via
 * `GET /admin/jobs/types` et le worker le prend en charge au démarrage.
 */
import reindexJob from './reindexJob';

const handlers = {
  [reindexJob.type]: reindexJob,
};

function get(type: string): any {
  return handlers[type] || null;
}

function has(type: string): boolean {
  return !!handlers[type];
}

function list(): Array<any> {
  return Object.keys(handlers).map((type) => {
    const handler = handlers[type];
    return {
      type: handler.type,
      label: handler.label,
      description: handler.description || '',
      allowConcurrent: !!handler.allowConcurrent,
    };
  });
}

module.exports = {
  get,
  has,
  list,
};
