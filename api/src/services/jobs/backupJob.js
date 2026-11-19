// @flow
/**
 * Traitement de sauvegarde complète de la base MongoDB.
 *
 * Exécuté par le worker (jamais dans le processus HTTP). Le dump est réalisé
 * en Node natif via les primitives partagées (`backupLib`) : les fichiers
 * produits respectent le format de répertoire `mongodump`
 * (`<db>/<collection>.bson.gz` + `<db>/<collection>.metadata.json.gz`),
 * donc ils se restaurent avec `mongorestore --gzip`… ou avec le job `restore`
 * de cette application.
 *
 * L'unité de travail est la collection : progression, erreurs unitaires et
 * reprise (`cursor` en scan complet, `cursorIndex` en liste ciblée) suivent
 * le cadre habituel des jobs. `retry-failed` ne sauvegarde que les
 * collections en échec et produit une archive marquée « partielle ».
 *
 * Configuration :
 *   - `BACKUP_DIR` (env) ou `backupDir` (config.json) : répertoire de
 *     destination des archives. Défaut : `/var/backups/studium`.
 *   - `params.excludedCollections` : collections supplémentaires à ignorer.
 *   - Par défaut sont ignorées : `system.*`, `logs`, `jobs`, `job_failures`
 *     (données d'exploitation volatiles, pas les données métier).
 *
 * Restauration : job `restore` (depuis l'IHM admin) ou, manuellement :
 *   tar -xf studium-<horodatage>.tar              # -> <db>/<collection>.bson.gz
 *   mongorestore --gzip --nsInclude='<db>.*' <db>/
 */
import fs from 'fs';
import path from 'path';

import db from '../../utils/db';
import {
  ARCHIVE_UNIT,
  DEFAULT_EXCLUDED_COLLECTIONS,
  createArchive,
  dumpCollection,
  ensureDir,
  formatBytes,
  getBackupDir,
  getDbName,
  getMongoUrl,
  listCollections,
  removeDir,
  stampOf,
  validateCollectionNames,
} from './backupLib';

/** Chemins du job, stables entre deux exécutions (reprise après requeue). */
function pathsOf(job: any): any {
  const backupDir = getBackupDir();
  const stamp = stampOf(job);
  const partial = Array.isArray(job.params && job.params.references)
    && job.params.references.length > 0;
  return {
    stamp: stamp,
    workDir: path.join(backupDir, `studium-${stamp}`),
    archive: path.join(backupDir, `studium-${stamp}${partial ? '-partiel' : ''}.tar`),
    partial: partial,
  };
}

function archiveInfo(job: any): string | null {
  try {
    const paths = pathsOf(job);
    const stat = fs.statSync(paths.archive);
    return `${paths.archive} (${formatBytes(stat.size)})`;
  } catch (error) {
    return null;
  }
}

async function runScan(ctx: any, client: any, dbName: string, workDir: string): Promise<void> {
  const params = ctx.job.params || {};
  const extraExcluded = validateCollectionNames(
    params.excludedCollections || [], 'excludedCollections');
  const excluded = DEFAULT_EXCLUDED_COLLECTIONS.concat(extraExcluded);

  let collections = (await listCollections())
    .filter((name) => excluded.indexOf(name) === -1)
    .sort();

  // Reprise après requeue : tout ce qui est <= au dernier curseur traité
  // est déjà dans le répertoire de travail (horodatage stable).
  if (ctx.job.cursor) {
    collections = collections.filter((name) => name > ctx.job.cursor);
  }

  await ctx.setTotal(collections.length + 1); // + 1 : création de l'archive

  for (let i = 0; i < collections.length; i++) {
    if (ctx.shouldStop()) {
      return;
    }
    const collection = collections[i];
    await ctx.setMessage(`Sauvegarde de la collection « ${collection} »…`);
    await dumpCollection(client, ctx, dbName, workDir, collection,
      { reference: collection, cursor: collection });
  }
}

async function runReferences(ctx: any, client: any, dbName: string, workDir: string,
                             collections: Array<string>): Promise<void> {
  await ctx.setTotal(collections.length + 1); // + 1 : création de l'archive
  const start = typeof ctx.job.cursorIndex === 'number' ? ctx.job.cursorIndex : 0;

  for (let i = start; i < collections.length; i++) {
    if (ctx.shouldStop()) {
      return;
    }
    const collection = collections[i];
    await ctx.setMessage(`Sauvegarde de la collection « ${collection} »…`);
    await dumpCollection(client, ctx, dbName, workDir, collection,
      { reference: collection, cursorIndex: i + 1 });
  }
}

const backupJob = {
  type: 'backup',
  label: 'Sauvegarde de la base (dump + archive)',
  description:
    'Dump complet de la base (documents BSON compressés par collection, format '
    + 'mongodump, lisible par mongorestore ou par le job « Restauration ») puis '
    + 'archive tar dans le répertoire de sauvegarde du serveur. Traitement long '
    + 'exécuté par le worker. '
    + `Collections ignorées par défaut : system.*, ${DEFAULT_EXCLUDED_COLLECTIONS.join(', ')}.`,
  unitLabel: 'collection',

  run: async (ctx: any): Promise<void> => {
    const client = db.get();
    if (!client) {
      throw new Error('Le worker n\'est pas connecté à MongoDB.');
    }
    const mongoUrl = getMongoUrl();
    const dbName = getDbName(mongoUrl);
    const paths = pathsOf(ctx.job);

    ensureDir(paths.workDir);

    const params = ctx.job.params || {};
    if (Array.isArray(params.references) && params.references.length > 0) {
      const collections = validateCollectionNames(params.references, 'references')
        .filter((name) => name !== ARCHIVE_UNIT);
      await runReferences(ctx, client, dbName, paths.workDir, collections);
    } else {
      await runScan(ctx, client, dbName, paths.workDir);
    }

    if (ctx.shouldStop()) {
      return;
    }

    const counts = ctx.counters();
    if (counts.failedCount > 0) {
      throw new Error(
        `${counts.failedCount} collection(s) en échec : aucune archive produite. `
        + 'Utilisez « Relancer les erreurs » pour sauvegarder uniquement les collections en échec.'
      );
    }

    await createArchive(ctx, paths.workDir, paths.archive, ARCHIVE_UNIT);

    // Le répertoire de travail intermédiaire n'est plus utile une fois
    // l'archive produite (annulation ou échec : il est conservé pour la reprise).
    removeDir(paths.workDir);
  },

  /** Message de clôture spécifique (sinon le worker parle de « fiches »). */
  finalMessage: (ctx: any): string => {
    const counts = ctx.counters();
    const collections = Math.max(0, counts.succeeded - 1); // hors unité « archive »
    const archive = archiveInfo(ctx.job);
    let message = `Terminé : ${collections} collection(s) sauvegardée(s)`;
    if (archive) {
      message += ` — archive : ${archive}`;
    }
    return message;
  },
};

module.exports = backupJob;
