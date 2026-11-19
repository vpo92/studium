// @flow
/**
 * Traitement de sauvegarde complète de la base MongoDB.
 *
 * Exécuté par le worker (jamais dans le processus HTTP). Le dump est réalisé
 * en Node natif via un curseur `raw` : le serveur renvoie directement les
 * octets BSON stockés, dans la trame exacte de `mongodump`. Les fichiers
 * produits respectent le format de répertoire `mongodump`
 * (`<db>/<collection>.bson.gz` + `<db>/<collection>.metadata.json.gz`),
 * donc ils se restaurent avec `mongorestore --gzip` sans outil supplémentaire
 * sur le worker.
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
 * Restauration :
 *   tar -xf studium-<horodatage>.tar              # -> <db>/<collection>.bson.gz
 *   mongorestore --gzip --nsInclude='<db>.*' <db>/
 */
import fs from 'fs';
import path from 'path';
import url from 'url';
import zlib from 'zlib';
import { spawn } from 'child_process';

import config from '../../../config';
import db from '../../utils/db';

const DEFAULT_BACKUP_DIR = '/var/backups/studium';
const DEFAULT_DB_NAME = 'studium';

// Données d'exploitation volatiles : sans intérêt dans une sauvegarde
// métier et potentiellement très volumineuses (logs est une capped
// collection). L'historique des jobs vit déjà dans Mongo en permanence.
const DEFAULT_EXCLUDED_COLLECTIONS = ['logs', 'jobs', 'job_failures'];

// Noms de collections acceptés (paramètres venant de l'API : validation
// stricte — le nom sert aussi à construire des chemins de fichiers).
const COLLECTION_NAME_RE = /^[A-Za-z0-9_\-\.+@]{1,255}$/;

const ARCHIVE_UNIT = 'archive';

function messageOf(error: any): string {
  if (!error) {
    return 'Erreur inconnue';
  }
  return error.message ? error.message : String(error);
}

function isCollectionNameValid(name: any): boolean {
  return typeof name === 'string'
    && name !== '.' && name !== '..'
    && COLLECTION_NAME_RE.test(name);
}

/**
 * Exécute une commande externe sans shell (arguments en tableau : aucune
 * injection possible) et ne conserve que la fin des sorties pour les
 * messages d'erreur.
 */
function runCommand(command: string, args: Array<string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';

    const append = (buffer: string, chunk: any): string =>
      (buffer + String(chunk)).slice(-4000);

    if (child.stdout) {
      child.stdout.on('data', (chunk) => { stdout = append(stdout, chunk); });
    }
    if (child.stderr) {
      child.stderr.on('data', (chunk) => { stderr = append(stderr, chunk); });
    }

    child.on('error', (error) => {
      if (error && error.code === 'ENOENT') {
        return reject(new Error(`${command} introuvable sur le worker.`));
      }
      return reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        return resolve({ stdout: stdout, stderr: stderr });
      }
      const tail = String(stderr || stdout)
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .slice(-3)
        .join(' / ');
      return reject(new Error(
        `${command} a échoué (code ${code})${tail ? ` : ${tail}` : ''}`
      ));
    });
  });
}

function getMongoUrl(): string {
  const mongoUrl = process.env.MONGODB_CONNECTION_STRING || config.mongooseDB;
  if (!mongoUrl) {
    throw new Error(
      'Aucune URL MongoDB configurée pour la sauvegarde (MONGODB_CONNECTION_STRING).'
    );
  }
  return mongoUrl;
}

/** Nom de la base à dumper : celui de l'URL de connexion, sinon `studium`. */
function getDbName(mongoUrl: string): string {
  if (process.env.MONGODB_DATABASE) {
    return process.env.MONGODB_DATABASE;
  }
  const parsed = url.parse(mongoUrl);
  const name = parsed.pathname ? parsed.pathname.replace(/^\//, '').split('?')[0] : '';
  return name || DEFAULT_DB_NAME;
}

function getBackupDir(): string {
  return path.resolve(process.env.BACKUP_DIR || config.backupDir || DEFAULT_BACKUP_DIR);
}

/** Horodatage stable pour un job donné (dérivé de createdAt) : identique
 *  après un requeue, donc la reprise écrit dans le même répertoire. */
function stampOf(job: any): string {
  const d = new Date(job.createdAt || Date.now());
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    + `-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

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

function ensureDir(dir: string): void {
  if (fs.existsSync(dir)) {
    if (!fs.statSync(dir).isDirectory()) {
      throw new Error(`BACKUP_DIR : ${dir} existe mais n'est pas un répertoire.`);
    }
    return;
  }
  const parent = path.dirname(dir);
  if (parent !== dir) {
    ensureDir(parent);
  }
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

function removeDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    return;
  }
  fs.readdirSync(dir).forEach((entry) => {
    const full = path.join(dir, entry);
    if (fs.lstatSync(full).isDirectory()) {
      removeDir(full);
    } else {
      fs.unlinkSync(full);
    }
  });
  fs.rmdirSync(dir);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} o`;
  }
  const units = ['Ko', 'Mo', 'Go', 'To'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${Math.round(value * 10) / 10} ${units[unit]}`;
}

function validateCollectionNames(names: any, what: string): Array<string> {
  if (!Array.isArray(names)) {
    const error: any = new Error(`params.${what} doit être un tableau de noms de collections.`);
    error.status = 400;
    throw error;
  }
  const unique = names.filter((name, index) => names.indexOf(name) === index);
  unique.forEach((name) => {
    if (!isCollectionNameValid(name)) {
      const error: any = new Error(`Nom de collection invalide : ${JSON.stringify(name)}`);
      error.status = 400;
      throw error;
    }
  });
  return unique;
}

function collectionNamespace(dbName: string, collection: string): string {
  return `${dbName}.${collection}`;
}

/**
 * Accès collection indépendant des versions du driver : avec le driver 2.x
 * du projet, `client.db(name)` résout la base de l'URL de connexion ; on ne
 * passe jamais le namespace complet à `collection()` (le driver 2.x le
 * préfixerait avec la base courante).
 */
function getCollection(client: any, dbName: string, collection: string): any {
  if (typeof client.db === 'function') {
    return client.db(dbName).collection(collection);
  }
  return client.collection(collectionNamespace(dbName, collection));
}

/** Toutes les collections de la base, hors collections système. */
async function listCollections(): Promise<Array<string>> {
  const cursor = db.get().listCollections({});
  const infos = typeof cursor.toArray === 'function'
    ? await cursor.toArray()
    : await cursor;
  return (infos || [])
    .map((info) => info.name)
    .filter((name) => !!name && name.indexOf('system.') !== 0);
}

/**
 * Dump d'une collection au format BSON mongodump : le curseur `raw: true`
 * renvoie directement les octets BSON stockés par le serveur (même trame
 * que mongodump), concaténés et gzipés dans un fichier temporaire puis
 * renommés — pas de demi-fichier en cas d'erreur, et aucun aller-retour
 * désérialisation/sérialisation.
 */
function dumpCollectionData(client: any, dbName: string, collection: string,
                            filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const target = `${filePath}.part`;
    const cursor = getCollection(client, dbName, collection).find({}, { raw: true });
    const stream = typeof cursor.stream === 'function'
      ? cursor.stream({ highWaterMark: 200 })
      : cursor;
    const gzip = zlib.createGzip();
    const writeStream = fs.createWriteStream(target);
    gzip.pipe(writeStream);

    let count = 0;
    let bytes = 0;
    let settled = false;

    const settle = (fn) => (error) => {
      if (settled) {
        return;
      }
      settled = true;
      stream.destroy();
      gzip.destroy();
      writeStream.destroy();
      fs.unlink(target, () => {});
      fn(error);
    };
    const fail = settle(reject);
    const succeed = () => {
      if (settled) {
        return;
      }
      settled = true;
      try {
        fs.renameSync(target, filePath);
      } catch (error) {
        return reject(error);
      }
      return resolve({ documents: count, bytes: bytes });
    };

    stream.on('data', (item) => {
      const buffers = Buffer.isBuffer(item) ? [item] : item;
      if (!Array.isArray(buffers) || buffers.some((b) => !Buffer.isBuffer(b))) {
        return fail(new Error(
          `curseur “raw” inattendu sur ${collectionNamespace(dbName, collection)} : document non-BSON reçu`
        ));
      }
      for (let i = 0; i < buffers.length; i++) {
        count += 1;
        bytes += buffers[i].length;
        if (!gzip.write(buffers[i])) {
          stream.pause();
        }
      }
      return undefined;
    });
    gzip.on('drain', () => stream.resume());
    stream.on('error', fail);
    gzip.on('error', fail);
    writeStream.on('error', fail);
    writeStream.on('close', succeed);
    stream.on('end', () => gzip.end());
    return undefined;
  });
}

function listIndexes(client: any, dbName: string, collection: string): Promise<Array<any>> {
  return new Promise((resolve, reject) => {
    getCollection(client, dbName, collection)
      .indexes((error, indexes) => {
        if (error) {
          return reject(error);
        }
        return resolve(indexes || []);
      });
  });
}

function gzipToFile(data: Buffer, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    zlib.gzip(data, (error, compressed) => {
      if (error) {
        return reject(error);
      }
      return fs.writeFile(filePath, compressed, (writeError) => {
        if (writeError) {
          return reject(writeError);
        }
        return resolve();
      });
    });
  });
}

/** Métadonnées d'index, au format `mongodump` (`<coll>.metadata.json.gz`). */
async function dumpCollectionMetadata(client: any, dbName: string, collection: string,
                                      dir: string): Promise<void> {
  const ns = collectionNamespace(dbName, collection);
  const indexes = await listIndexes(client, dbName, collection);
  const metadata = {
    options: {},
    indexes: indexes.map((index) => Object.assign({ ns: ns }, index)),
  };
  await gzipToFile(
    Buffer.from(JSON.stringify(metadata), 'utf8'),
    path.join(dir, `${collection}.metadata.json.gz`)
  );
}

async function dumpCollection(client: any, ctx: any, dbName: string, workDir: string,
                              collection: string, cursorUpdate: any): Promise<void> {
  const dbDir = path.join(workDir, dbName);
  ensureDir(dbDir);

  try {
    const stats = await dumpCollectionData(
      client, dbName, collection, path.join(dbDir, `${collection}.bson.gz`));
    await dumpCollectionMetadata(client, dbName, collection, dbDir);
    await ctx.step(Object.assign(
      {
        reference: collection,
        success: true,
        message: `${stats.documents} document(s), ${formatBytes(stats.bytes)}`,
      },
      cursorUpdate
    ));
  } catch (error) {
    ctx.logger.error(`backupJob: dump ${collectionNamespace(dbName, collection)} failed: ${messageOf(error)}`);
    // Pas de curseur sur un échec : la reprise automatique (requeue)
    // retentera cette collection ; « Relancer les erreurs » aussi.
    await ctx.step({ reference: collection, success: false, error: messageOf(error) });
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
    await dumpCollection(client, ctx, dbName, workDir, collection, { cursor: collection });
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
    await dumpCollection(client, ctx, dbName, workDir, collection, { cursorIndex: i + 1 });
  }
}

async function createArchive(ctx: any, workDir: string, archive: string): Promise<void> {
  await ctx.setMessage('Création de l\'archive…');
  // Archive non compressée : les collections sont déjà gzipées (« -z » ne
  // gagnerait rien et coûterait du CPU) ; `tar` est présent dans toutes les
  // bases Debian de l'image.
  await runCommand('tar', ['-cf', archive, '-C', workDir, '.']);

  const size = fs.statSync(archive).size;
  if (!size) {
    throw new Error('Archive vide après empaquetage.');
  }
  await ctx.step({ reference: ARCHIVE_UNIT, success: true });
  await ctx.setMessage(`Archive créée : ${archive} (${formatBytes(size)})`);
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

const backupJob = {
  type: 'backup',
  label: 'Sauvegarde de la base (dump + archive)',
  description:
    'Dump complet de la base (documents BSON compressés par collection, format '
    + 'mongodump, lisible par mongorestore) puis archive tar dans le répertoire '
    + 'de sauvegarde du serveur. Traitement long exécuté par le worker. '
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

    await createArchive(ctx, paths.workDir, paths.archive);

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
