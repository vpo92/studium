// @flow
/**
 * Traitement de restauration de la base MongoDB depuis une archive produite
 * par le job `backup` (`studium-<horodatage>.tar`).
 *
 * ⚠ Opération DESTRUCTRICE : toutes les collections de la base courante sont
 * supprimées puis remplacées par le contenu du dump. Protections :
 *   - le job refuse de démarrer sans `params.confirm === 'RESTAURER'` ;
 *   - le nom d'archive est validé (nom simple, format backup) et doit exister
 *     dans BACKUP_DIR (liste via `GET /admin/jobs/backups`) ;
 *   - par défaut (`params.preBackup !== false`), une sauvegarde de sécurité
 *     de l'état courant est produite AVANT toute écriture
 *     (`studium-pre-restore-<horodatage>.tar`) — elle permet de revenir en
 *     arrière si la restauration échoue ou est annulée en cours de route ;
 *   - les collections d'exploitation (`jobs`, `job_failures`, `logs`) ne sont
 *     JAMAIS supprimées, même absentes du dump ; `system.*` non plus.
 *
 * Déroulé (unité de travail = collection) :
 *   1. phase « préparation » (non destructive, annulable sans risque) :
 *      dump de sécurité puis extraction de l'archive ;
 *   2. phase « restauration » : pour chaque collection du dump — drop de la
 *      collection courante, réinsertion par lots des documents BSON du fichier
 *      (désérialisation `promoteValues/promoteLongs: false` : les types BSON
 *      sont conservés à l'octet près), puis recréation des index du
 *      `.metadata.json.gz` (formats mongodump anciens et récents acceptés) ;
 *   3. phase « nettoyage » : suppression des collections vivantes absentes du
 *      dump (« remplacer TOUTES les données »).
 *
 * Repreneur : le curseur (`r:<collection>`) saute les phases déjà faites
 * après un requeue ; les collections étant restaurées par drop + recréation,
 * l'opération est idempotente. En revanche, une ANNULATION ou un échec en
 * phase 2/3 laisse la base dans un état mixte (d'où le pre-restore).
 *
 * L'archive peut provenir d'une autre base source : les fichiers sont relus
 * quel que soit le nom du répertoire `<db>` interne, et restaurés dans la
 * base de connexion du worker.
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

import bson from 'bson';

import db from '../../utils/db';
import {
  DEFAULT_EXCLUDED_COLLECTIONS,
  ensureDir,
  formatBytes,
  getBackupDir,
  getDbName,
  getMongoUrl,
  getCollection,
  listCollections,
  messageOf,
  removeDir,
  runCommand,
  stampOf,
  createArchive,
  dumpCollection,
  validateArchiveName,
} from './backupLib';

const CONFIRM_PHRASE = 'RESTAURER';
const INSERT_BATCH = 1000;
const BSON_DOC_MAX = 16 * 1024 * 1024;

// Désérialisation stricte : les Int32/Long/Double restent des enveloppes
// bson et le driver les réécrit tels quels (vérifié : round-trip identique
// octet à octet pour les types courants).
const DESERIALIZE_OPTIONS = { promoteValues: false, promoteLongs: false };
const serializer = new bson.BSON();

// Références d'étapes hors restauration pure (visibles dans l'historique).
const PRE_BACKUP_UNIT = 'pre-backup:';
const EXTRACTION_UNIT = 'extraction';

function pathsOf(job: any): any {
  const backupDir = getBackupDir();
  const stamp = stampOf(job);
  const root = path.join(backupDir, `studium-restore-${stamp}`);
  return {
    stamp: stamp,
    preWorkDir: path.join(root, 'pre'),
    preArchive: path.join(backupDir, `studium-pre-restore-${stamp}.tar`),
    extractDir: path.join(root, 'extract'),
  };
}

function promisify(fn: Function): Promise<any> {
  return new Promise((resolve, reject) => {
    fn((error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

function isNamespaceMissing(error: any): boolean {
  const code = error && (error.code !== undefined ? error.code : error.codeName);
  return code === 26 || /ns does not exist|not found/i.test(messageOf(error));
}

/** drop() en tolérant l'absence de la collection (première restauration). */
async function dropCollection(collectionHandle: any): Promise<void> {
  try {
    await promisify((cb) => collectionHandle.drop(cb));
  } catch (error) {
    if (!isNamespaceMissing(error)) {
      throw error;
    }
  }
}

/** Normalise l'Extended JSON relaxé des métadonnées de mongodump >= 100.x. */
function unwrapEjson(value: any): any {
  if (Array.isArray(value)) {
    return value.map(unwrapEjson);
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 1) {
      const only = keys[0];
      if (only === '$numberInt') {
        return parseInt(String(value[only]), 10);
      }
      if (only === '$numberLong') {
        return bson.Long.fromString(String(value[only]));
      }
      if (only === '$numberDouble') {
        return new bson.Double(parseFloat(String(value[only])));
      }
      if (only === '$numberDecimal') {
        return bson.Decimal128.fromString(String(value[only]));
      }
      if (only === '$oid') {
        return new bson.ObjectID(String(value[only]));
      }
      if (only === '$date') {
        return new Date(String(value[only]));
      }
    }
    const plain = {};
    Object.keys(value).forEach((key) => { plain[key] = unwrapEjson(value[key]); });
    return plain;
  }
  return value;
}

/**
 * Lit un fichier `<coll>.bson.gz` (trame mongodump : documents BSON
 * concaténés, préfixés par leur taille) et insère par lots.
 */
function streamInsert(filePath: string, collectionHandle: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);
    const unzip = zlib.createUnzip();
    readStream.pipe(unzip);

    let pending = Buffer.alloc(0);
    let batch = [];
    let count = 0;
    let bytes = 0;
    let settled = false;
    // Chaîne d'insertions : chaque lot est inséré après le précédent, pour
    // ne jamais accumuler plus d'un lot de travail côté serveur.
    let chain = Promise.resolve();

    const settle = (fn) => (value) => {
      if (settled) {
        return;
      }
      settled = true;
      readStream.destroy();
      unzip.destroy();
      fn(value);
    };
    const fail = settle(reject);
    const finish = settle(() => resolve({ documents: count, bytes: bytes }));

    const flush = () => {
      if (!batch.length) {
        return;
      }
      const docs = batch;
      batch = [];
      chain = chain.then(() => promisify((cb) => collectionHandle.insert(docs, { ordered: false }, cb)))
        .then(() => {
          if (!settled) {
            unzip.resume();
          }
        })
        .catch((error) => fail(error));
      unzip.pause();
    };

    unzip.on('data', (chunk) => {
      if (settled) {
        return;
      }
      pending = Buffer.concat([pending, chunk]);
      while (pending.length >= 4) {
        const size = pending.readUInt32LE(0);
        if (size < 5 || size > BSON_DOC_MAX) {
          return fail(new Error(
            `trame BSON invalide dans ${path.basename(filePath)} (taille annoncée ${size})`
          ));
        }
        if (pending.length < size) {
          break;
        }
        try {
          batch.push(serializer.deserialize(pending.slice(0, size), DESERIALIZE_OPTIONS));
        } catch (error) {
          return fail(new Error(
            `document illisible dans ${path.basename(filePath)} : ${messageOf(error)}`
          ));
        }
        count += 1;
        bytes += size;
        pending = pending.slice(size);
        if (batch.length >= INSERT_BATCH) {
          flush();
        }
      }
      return undefined;
    });
    unzip.on('error', fail);
    readStream.on('error', fail);
    unzip.on('end', () => {
      flush();
      chain.then(finish, (error) => fail(error));
    });
    return undefined;
  });
}

/** Recrée les index secondaires décrits par `<coll>.metadata.json.gz`. */
async function restoreIndexes(extractSubDir: string, collection: string,
                              collectionHandle: any): Promise<number> {
  const metaPath = path.join(extractSubDir, `${collection}.metadata.json.gz`);
  if (!fs.existsSync(metaPath)) {
    return 0;
  }
  let metadata;
  try {
    metadata = unwrapEjson(JSON.parse(zlib.gunzipSync(fs.readFileSync(metaPath)).toString('utf8')));
  } catch (error) {
    // Métadonnées corrompues : la collection est marquée en échec (le
    // détail reste visible dans les erreurs unitaires du job).
    throw new Error(`métadonnées illisibles pour ${collection} : ${messageOf(error)}`);
  }

  let recreated = 0;
  const indexes = Array.isArray(metadata && metadata.indexes) ? metadata.indexes : [];
  for (let i = 0; i < indexes.length; i++) {
    const index = indexes[i];
    if (!index || !index.key) {
      continue;
    }
    const keys = Object.keys(index.key);
    if (keys.length === 1 && keys[0] === '_id') {
      continue; // index _id recréé automatiquement à l'insertion
    }
    const options = Object.assign({}, index);
    delete options.key;
    delete options.ns;
    delete options.v;
    await promisify((cb) => collectionHandle.createIndex(index.key,
      Object.assign({ background: true }, options), cb));
    recreated += 1;
  }
  return recreated;
}

function listDumpCollections(extractSubDir: string): Array<string> {
  return fs.readdirSync(extractSubDir)
    .filter((file) => /\.bson\.gz$/.test(file))
    .map((file) => file.replace(/\.bson\.gz$/, ''))
    .sort();
}

/** Sous-répertoire <db> de l'archive extraite (le nom importe peu). */
function findDumpSubDir(extractDir: string): string {
  const entries = fs.readdirSync(extractDir)
    .map((entry) => path.join(extractDir, entry))
    .filter((entry) => fs.statSync(entry).isDirectory());
  if (!entries.length) {
    throw new Error('Archive sans répertoire de base : dump invalide.');
  }
  return entries[0];
}

/**
 * Extrait l'archive si nécessaire (première phase, ou reprise après un
 * requeue dont le répertoire d'extraction a disparu).
 */
async function ensureExtracted(archivePath: string, paths: any): Promise<string> {
  try {
    return findDumpSubDir(paths.extractDir);
  } catch (error) {
    ensureDir(paths.extractDir);
    await runCommand('tar', ['-xf', archivePath, '-C', paths.extractDir]);
    const subDir = findDumpSubDir(paths.extractDir);
    if (!listDumpCollections(subDir).length) {
      throw new Error(`Archive sans collections exploitables : ${path.basename(archivePath)}.`);
    }
    return subDir;
  }
}

/**
 * Phase 1 — sauvegarde de sécurité de l'état courant (avant toute écriture).
 */
async function preBackup(ctx: any, client: any, dbName: string, paths: any): Promise<void> {
  const collections = (await listCollections())
    .filter((name) => DEFAULT_EXCLUDED_COLLECTIONS.indexOf(name) === -1)
    .sort();

  await ctx.setMessage('Sauvegarde de sécurité de l\'état courant…');
  let failed = 0;
  for (let i = 0; i < collections.length; i++) {
    if (ctx.shouldStop()) {
      return;
    }
    const ok = await dumpCollection(
      client, ctx, dbName, paths.preWorkDir, collections[i],
      { reference: `${PRE_BACKUP_UNIT}${collections[i]}` });
    if (!ok) {
      failed += 1;
    }
  }
  if (ctx.shouldStop()) {
    return;
  }
  if (failed > 0) {
    throw new Error(
      `Sauvegarde de sécurité en échec sur ${failed} collection(s) : restauration interrompue avant toute écriture.`
    );
  }
  await createArchive(ctx, paths.preWorkDir, paths.preArchive, `${PRE_BACKUP_UNIT}archive`);
  removeDir(paths.preWorkDir);
}

/**
 * Restaure une collection : drop, insertion depuis le BSON gzipé, index.
 * Renvoie le nombre de collections restaurées (0 ou 1).
 */
async function restoreCollection(ctx: any, client: any, dbName: string, extractSubDir: string,
                                 collection: string): Promise<boolean> {
  const handle = getCollection(client, dbName, collection);
  try {
    await dropCollection(handle);
    const stats = await streamInsert(
      path.join(extractSubDir, `${collection}.bson.gz`), handle);
    const indexes = await restoreIndexes(extractSubDir, collection, handle);
    let message = `${stats.documents} document(s), ${formatBytes(stats.bytes)}`;
    if (indexes > 0) {
      message += `, ${indexes} index recréé(s)`;
    }
    await ctx.step({
      reference: collection,
      success: true,
      message: message,
      cursor: `r:${collection}`,
    });
    return true;
  } catch (error) {
    ctx.logger.error(`restoreJob: restore ${collection} failed: ${messageOf(error)}`);
    await ctx.step({
      reference: collection,
      success: false,
      error: messageOf(error),
      // Pas de curseur : la reprise rejouera cette collection (idempotent).
    });
    return false;
  }
}

const restoreJob = {
  type: 'restore',
  label: 'Restauration de la base (depuis une archive)',
  description:
    '⚠ Destructif : supprime toutes les données de la base courante et les '
    + 'remplace par le contenu d\'une archive produite par le job « Sauvegarde de la '
    + 'base » (collections absentes du dump supprimées, sauf jobs/job_failures/logs). '
    + 'Une sauvegarde de sécurité de l\'état courant est produite avant toute '
    + 'écriture (désactivable). Nécessite params.confirm = « RESTAURER ».',
  unitLabel: 'collection',

  run: async (ctx: any): Promise<void> => {
    const client = db.get();
    if (!client) {
      throw new Error('Le worker n\'est pas connecté à MongoDB.');
    }
    const params = ctx.job.params || {};

    if (params.confirm !== CONFIRM_PHRASE) {
      throw new Error(
        `Confirmation manquante : params.confirm doit valoir « ${CONFIRM_PHRASE} ».`
      );
    }
    const archiveName = validateArchiveName(params.archive);
    const archivePath = path.join(getBackupDir(), archiveName);
    if (!fs.existsSync(archivePath) || !fs.statSync(archivePath).isFile()) {
      throw new Error(`Archive introuvable dans le répertoire de sauvegarde : ${archiveName}.`);
    }
    const withPreBackup = params.preBackup !== false;

    const dbName = getDbName(getMongoUrl());
    const paths = pathsOf(ctx.job);
    const summary = { restored: 0, dropped: 0, preArchive: null };
    ctx.restoreSummary = summary; // lu par finalMessage

    // ---------------------------------------------------------------
    // Phase 1 — préparation (non destructive : annulable sans risque)
    // ---------------------------------------------------------------
    if (!ctx.job.cursor) {
      if (withPreBackup) {
        await preBackup(ctx, client, dbName, paths);
        if (ctx.shouldStop()) {
          return;
        }
        summary.preArchive = paths.preArchive;
      }

      await ctx.setMessage(`Extraction de l'archive ${archiveName}…`);
      await ensureExtracted(archivePath, paths);
      await ctx.step({ reference: EXTRACTION_UNIT, success: true });
    }

    if (ctx.shouldStop()) {
      return;
    }

    // ---------------------------------------------------------------
    // Phase 2 — restauration à proprement parler (destructive)
    // ---------------------------------------------------------------
    const extractSubDir = await ensureExtracted(archivePath, paths);
    const dumpCollections = listDumpCollections(extractSubDir);
    if (!dumpCollections.length) {
      throw new Error(
        `Archive sans collections exploitables : ${archiveName} (restauration refusée).`);
    }
    const liveCollections = await listCollections();
    const extras = liveCollections
      .filter((name) => dumpCollections.indexOf(name) === -1)
      .filter((name) => DEFAULT_EXCLUDED_COLLECTIONS.indexOf(name) === -1)
      .sort();

    let collections = dumpCollections;
    if (ctx.job.cursor) {
      collections = dumpCollections.filter((name) => `r:${name}` > ctx.job.cursor);
    }
    // Le total inclut les unités déjà validées (pré-backup, extraction,
    // collections reprises) pour que la barre reste cohérente.
    await ctx.setTotal(
      collections.length + extras.length + ctx.counters().processed);

    let failed = 0;
    for (let i = 0; i < collections.length; i++) {
      if (ctx.shouldStop()) {
        return;
      }
      await ctx.setMessage(`Restauration de la collection « ${collections[i]} »…`);
      const ok = await restoreCollection(ctx, client, dbName, extractSubDir, collections[i]);
      if (ok) {
        summary.restored += 1;
      } else {
        failed += 1;
      }
    }

    if (ctx.shouldStop()) {
      return;
    }
    if (failed > 0) {
      throw new Error(
        `${failed} collection(s) en échec : la base est dans un état mixte. `
        + (summary.preArchive
          ? `Sauvegarde de sécurité : ${summary.preArchive}. Relancez une restauration complète si nécessaire.`
          : 'Relancez une restauration complète (sans sauvegarde de sécurité préalable).')
      );
    }

    // ---------------------------------------------------------------
    // Phase 3 — suppression des collections absentes du dump
    // ---------------------------------------------------------------
    for (let i = 0; i < extras.length; i++) {
      if (ctx.shouldStop()) {
        return;
      }
      const collection = extras[i];
      await ctx.setMessage(`Suppression de la collection « ${collection} » (absente du dump)…`);
      try {
        await dropCollection(getCollection(client, dbName, collection));
        summary.dropped += 1;
        await ctx.step({ reference: `drop:${collection}`, success: true });
      } catch (error) {
        failed += 1;
        await ctx.step({ reference: `drop:${collection}`, success: false, error: messageOf(error) });
      }
    }

    if (failed > 0) {
      throw new Error(`${failed} opération(s) en échec pendant la restauration.`);
    }

    removeDir(path.join(getBackupDir(), `studium-restore-${paths.stamp}`));
  },

  finalMessage: (ctx: any): string => {
    const summary = ctx.restoreSummary || {};
    let message = `Restauration terminée : ${summary.restored || 0} collection(s) restaurée(s)`;
    if (summary.dropped) {
      message += `, ${summary.dropped} supprimée(s)`;
    }
    if (summary.preArchive && fs.existsSync(summary.preArchive)) {
      message += ` — sauvegarde de sécurité : ${summary.preArchive}`
        + ` (${formatBytes(fs.statSync(summary.preArchive).size)})`;
    }
    return message;
  },
};

module.exports = restoreJob;
