// @flow
/**
 * Primitives partagées par les jobs `backup` et `restore`.
 *
 * Contient tout ce qui touche au système de fichiers, aux commandes
 * externes et au dump d'une collection au format mongodump. Ces fonctions
 * sont volontairement sans état : le suivi de progression passe par le
 * `ctx` du job appelant (via `dumpCollection` / `createArchive`).
 */
import fs from 'fs';
import path from 'path';
import url from 'url';
import zlib from 'zlib';
import { spawn } from 'child_process';

import config from '../../../config';
import db from '../../utils/db';

export const DEFAULT_BACKUP_DIR = '/var/backups/studium';
export const DEFAULT_DB_NAME = 'studium';

// Données d'exploitation volatiles : sans intérêt dans une sauvegarde
// métier et potentiellement très volumineuses (logs est une capped
// collection). Pour la restauration, ce sont aussi des collections qu'il
// ne faut JAMAIS supprimer (le job de restauration vit dans `jobs`).
export const DEFAULT_EXCLUDED_COLLECTIONS = ['logs', 'jobs', 'job_failures'];

// Unité de travail correspondant à l'empaquetage tar.
export const ARCHIVE_UNIT = 'archive';

// Noms de collections acceptés (paramètres venant de l'API : validation
// stricte — le nom sert aussi à construire des chemins de fichiers).
export const COLLECTION_NAME_RE = /^[A-Za-z0-9_\-\.+@]{1,255}$/;

// Fichiers d'archive produits par le job backup (et leurs sauvegardes de
// sécurité « pre-restore ») : c'est la seule chose que le job restore
// accepte de lire.
export const ARCHIVE_NAME_RE = /^studium-[A-Za-z0-9_\-\.]{8,120}\.tar$/;

export function messageOf(error: any): string {
  if (!error) {
    return 'Erreur inconnue';
  }
  return error.message ? error.message : String(error);
}

export function isCollectionNameValid(name: any): boolean {
  return typeof name === 'string'
    && name !== '.' && name !== '..'
    && COLLECTION_NAME_RE.test(name);
}

/**
 * Exécute une commande externe sans shell (arguments en tableau : aucune
 * injection possible) et ne conserve que la fin des sorties pour les
 * messages d'erreur.
 */
export function runCommand(command: string, args: Array<string>): Promise<any> {
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

export function getMongoUrl(): string {
  const mongoUrl = process.env.MONGODB_CONNECTION_STRING || config.mongooseDB;
  if (!mongoUrl) {
    throw new Error(
      'Aucune URL MongoDB configurée (MONGODB_CONNECTION_STRING).'
    );
  }
  return mongoUrl;
}

/** Nom de la base de l'URL de connexion, sinon `studium`. */
export function getDbName(mongoUrl: string): string {
  if (process.env.MONGODB_DATABASE) {
    return process.env.MONGODB_DATABASE;
  }
  const parsed = url.parse(mongoUrl);
  const name = parsed.pathname ? parsed.pathname.replace(/^\//, '').split('?')[0] : '';
  return name || DEFAULT_DB_NAME;
}

export function getBackupDir(): string {
  return path.resolve(process.env.BACKUP_DIR || config.backupDir || DEFAULT_BACKUP_DIR);
}

/** Horodatage stable pour un job donné (dérivé de createdAt) : identique
 *  après un requeue, donc la reprise écrit dans le même répertoire. */
export function stampOf(job: any): string {
  const d = new Date(job.createdAt || Date.now());
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    + `-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function ensureDir(dir: string): void {
  if (fs.existsSync(dir)) {
    if (!fs.statSync(dir).isDirectory()) {
      throw new Error(`Le chemin ${dir} existe mais n'est pas un répertoire.`);
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

export function removeDir(dir: string): void {
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

export function formatBytes(bytes: number): string {
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

export function validateCollectionNames(names: any, what: string): Array<string> {
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

/** Valide un nom d'archive fournie par l'API (aucun chemin, format attendu). */
export function validateArchiveName(name: any): string {
  if (typeof name !== 'string' || name !== path.basename(name)
    || !ARCHIVE_NAME_RE.test(name)) {
    const error: any = new Error(
      `Nom d'archive invalide : ${JSON.stringify(name)} `
      + '(utilise la liste fournie par GET /admin/jobs/backups).'
    );
    error.status = 400;
    throw error;
  }
  return name;
}

/**
 * Chemin absolu d'une archive dans BACKUP_DIR, prêt à être lu (téléchargement,
 * restauration). Valide le nom (aucun chemin autorisé) et vérifie que le
 * fichier existe et est un fichier régulier ; renvoie null sinon.
 * Lève une erreur `status = 400` si le nom est invalide.
 */
export function getArchivePath(name: any): string | null {
  validateArchiveName(name);
  const file = path.join(getBackupDir(), name);
  let stat = null;
  try {
    stat = fs.statSync(file);
  } catch (error) {
    return null;
  }
  return stat.isFile() ? file : null;
}

/* --------------------------------------------------------------------- *
 *  Téléversement d'archives (POST /admin/jobs/backups)
 * --------------------------------------------------------------------- */

// Limite par défaut d'un téléversement : 2 Go (les dumps complets de la base
// dépassent rarement quelques centaines de Mo). Ajustable via
// BACKUP_UPLOAD_MAX_BYTES ; attention aussi au client_max_body_size du
// proxy nginx placé devant l'API.
export const DEFAULT_UPLOAD_MAX_BYTES = 2 * 1024 * 1024 * 1024;

export function getUploadMaxBytes(): number {
  const configured = parseInt(process.env.BACKUP_UPLOAD_MAX_BYTES, 10);
  return configured > 0 ? configured : DEFAULT_UPLOAD_MAX_BYTES;
}

/** Horodatage local `AAAAMMJJ-HHMMSS` (même format que stampOf). */
function nowStamp(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
    + `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/**
 * Nom d'archive téléversée à partir du nom d'origine choisi par
 * l'utilisateur : le nom est nettoyé (aucun chemin, aucun caractère hors
 * [A-Za-z0-9._-], extensions .tar/.tar.gz/.tgz retirées) puis inséré dans le
 * format imposé par ARCHIVE_NAME_RE, afin que le fichier apparaisse dans la
 * liste et soit restaurable. Ne lève jamais d'erreur : tout nom se réduit à
 * quelque chose de valide.
 */
export function buildUploadArchiveName(original: any, date?: Date): string {
  let base = typeof original === 'string' ? path.basename(original) : '';
  base = base
    .replace(/\.(tar\.gz|tgz|tar|gz)$/i, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-._]+/, '')
    .replace(/[-._]+$/, '')
    .slice(0, 64);

  const stamp = nowStamp(date || new Date());
  const middle = `${base ? `upload-${stamp}-${base}` : `upload-${stamp}`}`
    .replace(/[-._]+$/, '')
    .slice(0, 120);
  const name = `studium-${middle}.tar`;
  if (ARCHIVE_NAME_RE.test(name)) {
    return name;
  }
  // Filet de sécurité (nom nettoyé devenu trop court) : horodatage seul.
  return `studium-upload-${stamp}.tar`;
}

/**
 * Rend le nom unique dans `dir` en ajoutant `-2`, `-3`… avant l'extension
 * tant qu'un fichier existe déjà ; renvoie null après 1000 tentatives.
 */
export function reserveUploadName(dir: string, name: string): string | null {
  if (!fs.existsSync(path.join(dir, name))) {
    return name;
  }
  const middle = name.slice('studium-'.length, -'.tar'.length);
  for (let attempt = 2; attempt <= 1000; attempt++) {
    const suffix = `-${attempt}`;
    const base = middle.slice(0, 120 - suffix.length).replace(/[-._]+$/, '');
    if (base.length < 8) {
      return null;
    }
    const candidate = `studium-${base}${suffix}.tar`;
    if (!ARCHIVE_NAME_RE.test(candidate)) {
      return null;
    }
    if (!fs.existsSync(path.join(dir, candidate))) {
      return candidate;
    }
  }
  return null;
}

/**
 * Vérifie la sortie d'un `tar -tf` : au moins une entrée `.bson.gz`, seule
 * chose que le job restore sait exploiter (dump au format mongodump).
 */
export function hasMongoDumpLayout(listing: any): boolean {
  if (typeof listing !== 'string') {
    return false;
  }
  return listing
    .split('\n')
    .map((line: string) => line.trim())
    .some((line: string) => /\.bson\.gz$/.test(line));
}

/**
 * Écrit le flux `source` (corps de requête) dans `tmpPath` sans jamais
 * dépasser `maxBytes` ; supprime le fichier partiel en cas d'échec. Le
 * fichier cible ne doit pas exister (ouverture synchrone « wx » : erreur
 * `code = EEXIST` sinon). Renvoie la taille écrite ; erreur `status = 413`
 * si la limite est dépassée, `status = 400` si la connexion est interrompue.
 * En succès, le fichier complet reste en place : c'est à l'appelant de le
 * renommer.
 *
 * @param options.keepSourceOpen true pour ne pas détruire `source` en cas
 *        d'échec (flux HTTP : détruire la requête avant l'envoi de la
 *        réponse couperait la connexion) ; l'appelant doit alors refermer
 *        lui-même le flux après avoir répondu.
 */
export function saveUploadStream(source: any, tmpPath: string, maxBytes: number,
                                 options?: any): Promise<number> {
  const keepSourceOpen = !!(options && options.keepSourceOpen);
  return new Promise((resolve, reject) => {
    // Ouverture synchrone : le fichier partiel existe dès que la promesse
    // démarre, donc tout échec ultérieur le laisse exactement au même état.
    let fd = null;
    try {
      fd = fs.openSync(tmpPath, 'wx');
    } catch (error) {
      return reject(error);
    }

    const out = fs.createWriteStream(undefined, { fd: fd });
    let received = 0;
    let settled = false;

    const fail = (error: any) => {
      if (settled) {
        return;
      }
      settled = true;
      source.unpipe(out);
      if (!keepSourceOpen && typeof source.destroy === 'function') {
        source.destroy();
      } else if (typeof source.pause === 'function') {
        source.pause();
      }
      try {
        out.destroy();
      } catch (destroyError) {
        // flux déjà fermé : sans importance.
      }
      try {
        // Nettoyage synchrone : aucun demi-fichier ne traîne dans BACKUP_DIR
        // une fois la promesse rejetée (en succès, rien n'est supprimé).
        fs.unlinkSync(tmpPath);
      } catch (unlinkError) {
        // fichier déjà parti : sans importance.
      }
      reject(error);
    };
    const succeed = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(received);
    };

    source.on('data', (chunk: any) => {
      received += chunk.length;
      if (received > maxBytes) {
        const error: any = new Error(
          `Téléversement trop volumineux (limite : ${formatBytes(maxBytes)}).`
        );
        error.status = 413;
        fail(error);
      }
    });
    source.on('error', fail);
    source.on('aborted', () => {
      const error: any = new Error('Connexion interrompue pendant le téléversement.');
      error.status = 400;
      fail(error);
    });
    out.on('error', fail);
    out.on('finish', succeed);
    source.pipe(out);
    return undefined;
  });
}

export function collectionNamespace(dbName: string, collection: string): string {
  return `${dbName}.${collection}`;
}

/**
 * Accès collection indépendant des versions du driver : avec le driver 2.x
 * du projet, `client.db(name)` résout la base de l'URL de connexion ; on ne
 * passe jamais le namespace complet à `collection()` (le driver 2.x le
 * préfixerait avec la base courante).
 */
export function getCollection(client: any, dbName: string, collection: string): any {
  if (typeof client.db === 'function') {
    return client.db(dbName).collection(collection);
  }
  return client.collection(collectionNamespace(dbName, collection));
}

/** Toutes les collections de la base, hors collections système. */
export async function listCollections(): Promise<Array<string>> {
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
export function dumpCollectionData(client: any, dbName: string, collection: string,
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

export function listIndexes(client: any, dbName: string, collection: string): Promise<Array<any>> {
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

export function gzipToFile(data: Buffer, filePath: string): Promise<void> {
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
export async function dumpCollectionMetadata(client: any, dbName: string, collection: string,
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

/**
 * Dump complet d'une collection (données + métadonnées) puis enregistrement
 * de l'unité dans le job appelant.
 *
 * @param stepFields champs passés à `ctx.step` (reference, cursor…),
 *        choisis par l'appelant (le backup avance le curseur, la
 *        sauvegarde de sécurité du restore ne doit pas y toucher).
 * @return true si la collection a été dumper avec succès.
 */
export async function dumpCollection(client: any, ctx: any, dbName: string, workDir: string,
                                     collection: string, stepFields: any): Promise<boolean> {
  const dbDir = path.join(workDir, dbName);
  ensureDir(dbDir);

  try {
    const stats = await dumpCollectionData(
      client, dbName, collection, path.join(dbDir, `${collection}.bson.gz`));
    await dumpCollectionMetadata(client, dbName, collection, dbDir);
    await ctx.step(Object.assign(
      {
        success: true,
        message: `${stats.documents} document(s), ${formatBytes(stats.bytes)}`,
      },
      stepFields
    ));
    return true;
  } catch (error) {
    ctx.logger.error(`backupLib: dump ${collectionNamespace(dbName, collection)} failed: ${messageOf(error)}`);
    // En échec, on ne fait PAS avancer le curseur : la reprise automatique
    // (requeue) ou « Relancer les erreurs » retentera cette collection.
    const fields = Object.assign({}, stepFields);
    delete fields.cursor;
    delete fields.cursorIndex;
    await ctx.step(Object.assign(
      { success: false, error: messageOf(error) },
      fields
    ));
    return false;
  }
}

/**
 * Empaquette le répertoire de dump en une archive tar (les collections
 * étant déjà gzipées, pas de double compression).
 */
export async function createArchive(ctx: any, workDir: string, archive: string,
                                    archiveRef: string): Promise<void> {
  await ctx.setMessage('Création de l\'archive…');
  // Archive non compressée : les collections sont déjà gzipées (« -z » ne
  // gagnerait rien et coûterait du CPU) ; `tar` est présent dans toutes les
  // bases Debian de l'image.
  await runCommand('tar', ['-cf', archive, '-C', workDir, '.']);

  const size = fs.statSync(archive).size;
  if (!size) {
    throw new Error('Archive vide après empaquetage.');
  }
  await ctx.step({ reference: archiveRef, success: true });
  await ctx.setMessage(`Archive créée : ${archive} (${formatBytes(size)})`);
}
