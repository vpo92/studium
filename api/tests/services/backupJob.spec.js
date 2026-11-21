// Spec unitaire du job de sauvegarde : pas de base ni de binaire requis —
// le client MongoDB est simulé (curseur « raw » émettant de vrais octets
// BSON) et seul `tar` est intercepté. Le contenu des dumps est vérifié :
// format mongodump (BSON concaténé gzipé) et métadonnées d'index.
import fs from 'fs';
import os from 'os';
import path from 'path';
import zlib from 'zlib';
import { EventEmitter } from 'events';
import { PassThrough } from 'stream';

import bson from 'bson';

jest.mock('child_process');
jest.mock('../../src/utils/db', () => ({
  get: jest.fn(),
}));

const childProcess = require('child_process');
const dbMock = require('../../src/utils/db');

const serializer = new bson.BSON();

process.env.MONGODB_CONNECTION_STRING = 'mongodb://fake-host:27017/studium-test';

const backupJob = require('../../src/services/jobs/backupJob');

// ---------------------------------------------------------------------------
// Faux client MongoDB
// ---------------------------------------------------------------------------

// documents par namespace, ou Error pour simuler un échec de curseur
let collectionDocs = {};
let failCollections = [];

function makeRawStream(collection) {
  const stream = new PassThrough({ objectMode: true });
  stream.destroy = stream.destroy || (() => { stream.emit('close'); });
  process.nextTick(() => {
    if (failCollections.indexOf(collection) !== -1) {
      stream.emit('error', new Error('connection reset by peer'));
      return;
    }
    const docs = collectionDocs[collection] || [];
    docs.forEach((doc) => stream.write(serializer.serialize(doc)));
    stream.end();
  });
  return stream;
}

function fakeClient() {
  const collectionHandle = (collection) => ({
    find: () => ({ stream: () => makeRawStream(collection) }),
    indexes: (cb) => process.nextTick(() => cb(null, [
      { v: 2, key: { _id: 1 }, name: '_id_' },
    ])),
  });
  return {
    // driver 2.x : client.db(name).collection(short)
    db: () => ({ collection: collectionHandle }),
    listCollections: () => ({
      toArray: async () => ([
        { name: 'users' },
        { name: 'prosopography' },
        { name: 'notes' },
        { name: 'jobs' },            // exclu en contenu, inclus en full
        { name: 'logs' },            // exclu en contenu, inclus en full
        { name: 'system.indexes' }, // exclu dans tous les modes
      ]),
    }),
  };
}

// ---------------------------------------------------------------------------
// Faux `tar`
// ---------------------------------------------------------------------------

// Listages des répertoires empaquetés (entrées + contenu du manifeste s'il
// existe) : permettent de contrôler ce que le job écrit avant l'archive, le
// workDir étant supprimé dès l'empaquement réussi.
const tarListings = [];

childProcess.spawn.mockImplementation((command, args) => {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  process.nextTick(() => {
    if (command === 'tar') {
      if (args[0] === '-cf' && args[3]) {
        const listing = { dir: args[3], entries: [], info: null };
        try {
          listing.entries = fs.readdirSync(args[3]);
          const infoPath = path.join(args[3], 'studium-backup-info.json.gz');
          if (listing.entries.indexOf('studium-backup-info.json.gz') !== -1) {
            listing.info = JSON.parse(
              zlib.gunzipSync(fs.readFileSync(infoPath)).toString('utf8'));
          }
        } catch (error) {
          // répertoire absent : listing vide.
        }
        tarListings.push(listing);
      }
      fs.writeFileSync(args[1], 'tar-content'); // ['-cf', archive, ...]
      child.emit('close', 0);
    } else {
      child.emit('close', 1);
    }
  });
  return child;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeJob(params) {
  return {
    _id: 'job-id',
    type: 'backup',
    params: params || {},
    status: 'running',
    total: 0,
    processed: 0,
    succeeded: 0,
    failedCount: 0,
    cursor: null,
    cursorIndex: null,
    createdAt: new Date(2026, 0, 2, 3, 4, 5),
  };
}

function makeCtx(job) {
  const counters = {
    processed: 0,
    succeeded: 0,
    failedCount: 0,
    cursor: job.cursor || null,
    cursorIndex: typeof job.cursorIndex === 'number' ? job.cursorIndex : null,
  };
  const ctx = {
    job: job,
    logger: { info: () => {}, warn: () => {}, error: () => {} },
    steps: [],
    messages: [],
    total: null,
    shouldStop: () => false,
    isCancelled: () => false,
    setTotal: async (total) => { ctx.total = total; },
    setMessage: async (message) => { ctx.messages.push(message); },
    step: async (step) => {
      ctx.steps.push(step);
      counters.processed += 1;
      if (step.success === false) {
        counters.failedCount += 1;
      } else {
        counters.succeeded += 1;
      }
      if (step.cursor) { counters.cursor = step.cursor; }
      if (step.cursorIndex) { counters.cursorIndex = step.cursorIndex; }
    },
    counters: () => Object.assign({}, counters),
  };
  return ctx;
}

function stampOf(date) {
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
    + `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

// Relit un fichier .bson.gz au format mongodump (BSON concaténé).
function readBsonFile(filePath) {
  const raw = zlib.gunzipSync(fs.readFileSync(filePath));
  const docs = [];
  let offset = 0;
  while (offset < raw.length) {
    const size = raw.readUInt32LE(offset);
    docs.push(serializer.deserialize(raw.slice(offset, offset + size)));
    offset += size;
  }
  return docs;
}

const sample = (n) => ([
  { _id: new bson.ObjectID(), name: `doc-${n}-a`, when: new Date(1000 * n) },
  { _id: new bson.ObjectID(), name: `doc-${n}-b`, big: 'x'.repeat(5000) },
]);

beforeEach(() => {
  process.env.BACKUP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'studium-backup-test-'));
  collectionDocs = { users: sample(1), prosopography: sample(2), notes: sample(3) };
  failCollections = [];
  tarListings.length = 0;
  dbMock.get.mockReturnValue(fakeClient());
});

// ---------------------------------------------------------------------------

describe('backupJob (cible : collections listées, mode relance)', () => {
  it('dump chaque collection puis produit une archive partielle', async () => {
    const job = makeJob({ references: ['users', 'prosopography'] });
    const ctx = makeCtx(job);

    await backupJob.run(ctx);

    // 2 collections + 1 unité « archive », dans l'ordre de la liste ciblée.
    expect(ctx.total).toBe(3);
    expect(ctx.steps.map((s) => s.reference)).toEqual(
      ['users', 'prosopography', 'archive']
    );
    expect(ctx.counters().failedCount).toBe(0);
    expect(ctx.steps[0].cursorIndex).toBe(1);
    expect(ctx.steps[1].cursorIndex).toBe(2);

    const archive = path.join(
      process.env.BACKUP_DIR, `studium-${stampOf(job.createdAt)}-contenu-partiel.tar`);
    expect(fs.existsSync(archive)).toBe(true);
    // Le répertoire de travail intermédiaire est nettoyé après archivage.
    expect(fs.existsSync(
      path.join(process.env.BACKUP_DIR, `studium-${stampOf(job.createdAt)}`)
    )).toBe(false);
  });

  it('rejette les noms de collections invalides', async () => {
    const job = makeJob({ references: ['ok; rm -rf /'] });
    await expect(backupJob.run(makeCtx(job))).rejects.toThrow(/invalide/);
  });
});

describe('backupJob (scan complet)', () => {
  it('mode contenu (défaut) : exclut users, jobs et logs, ignore system.*', async () => {
    const job = makeJob({});
    const ctx = makeCtx(job);

    await backupJob.run(ctx);

    // users/jobs/logs absents du dump métier ; archive en dernier.
    expect(ctx.steps.map((s) => s.reference)).toEqual(
      ['notes', 'prosopography', 'archive']
    );
    expect(ctx.steps[0].cursor).toBe('notes');
    expect(ctx.steps[1].cursor).toBe('prosopography');

    // Archive nommée selon le type (contenu), et workDir nettoyé.
    const dir = process.env.BACKUP_DIR;
    expect(fs.readdirSync(dir).sort()).toEqual([`studium-${stampOf(job.createdAt)}-contenu.tar`]);

    // Manifeste écrit avant empaquetage : le restore s'y fier (vérifié sur
    // le workDir d'une exécution annulée ci-dessous, ici absent — nettoyé).
  });

  it('mode full : dump de l\'intégralité de la base (users, jobs, logs inclus)', async () => {
    const job = makeJob({ mode: 'full' });
    const ctx = makeCtx(job);

    await backupJob.run(ctx);

    expect(ctx.steps.map((s) => s.reference)).toEqual(
      ['jobs', 'logs', 'notes', 'prosopography', 'users', 'archive']
    );
    const dir = process.env.BACKUP_DIR;
    expect(fs.readdirSync(dir).sort()).toEqual([`studium-${stampOf(job.createdAt)}-full.tar`]);
  });

  it('rejette un mode invalide (400) sans rien dumper', async () => {
    const job = makeJob({ mode: 'contenu-total' });
    const ctx = makeCtx(job);
    await expect(backupJob.run(ctx)).rejects.toThrow(/Type de sauvegarde invalide/);
    expect(ctx.steps).toEqual([]);
  });

  it('écrit un manifeste de type dans l\'archive', async () => {
    const job = makeJob({ mode: 'full' });
    const ctx = makeCtx(job);

    await backupJob.run(ctx);

    const packing = tarListings[tarListings.length - 1];
    expect(packing.entries).toContain('studium-backup-info.json.gz');
    expect(packing.info).toMatchObject({ mode: 'full', dbName: 'studium-test' });
  });

  it('écrit des dumps BSON + métadonnées conformes au format mongodump', async () => {
    // On intercepte juste avant le nettoyage : annulation après le 2e dump.
    const job = makeJob({});
    const ctx = makeCtx(job);
    let stopAfter = 0;
    ctx.shouldStop = () => stopAfter >= 2;
    const originalStep = ctx.step;
    ctx.step = async (step) => {
      await originalStep(step);
      stopAfter += 1;
    };

    await backupJob.run(ctx);

    const dbDir = path.join(
      process.env.BACKUP_DIR, `studium-${stampOf(job.createdAt)}`, 'studium-test');
    const dumped = readBsonFile(path.join(dbDir, 'prosopography.bson.gz'));
    expect(dumped.map((d) => d.name)).toEqual(['doc-2-a', 'doc-2-b']);
    expect(dumped[1].big).toHaveLength(5000);

    const meta = JSON.parse(
      zlib.gunzipSync(fs.readFileSync(path.join(dbDir, 'prosopography.metadata.json.gz')))
        .toString('utf8'));
    expect(meta.indexes[0].name).toBe('_id_');
    expect(meta.indexes[0].ns).toBe('studium-test.prosopography');

    // Annulation : pas d'archive, workDir conservé pour la reprise.
    const archives = fs.readdirSync(process.env.BACKUP_DIR).filter((f) => f.endsWith('.tar'));
    expect(archives).toEqual([]);
  });

  it('reprend après le curseur connu (job remis en file)', async () => {
    const job = makeJob({});
    job.cursor = 'notes'; // « prosopography » reste à traiter
    const ctx = makeCtx(job);

    await backupJob.run(ctx);

    expect(ctx.steps.map((s) => s.reference)).toEqual(['prosopography', 'archive']);
  });

  it('échoue sans produire d’archive si une collection est en erreur', async () => {
    failCollections = ['prosopography'];
    const job = makeJob({});
    const ctx = makeCtx(job);

    await expect(backupJob.run(ctx)).rejects.toThrow(/aucune archive produite/);

    const failed = ctx.steps.filter((s) => s.success === false);
    expect(failed.map((s) => s.reference)).toEqual(['prosopography']);
    // Pas d'avancement du curseur sur un échec : la reprise le retentera.
    expect(failed[0].cursor).toBeUndefined();
    const archives = fs.readdirSync(process.env.BACKUP_DIR).filter((f) => f.endsWith('.tar'));
    expect(archives).toEqual([]);
    // workDir conservé pour la reprise.
    expect(fs.existsSync(
      path.join(process.env.BACKUP_DIR, `studium-${stampOf(job.createdAt)}`)
    )).toBe(true);
  });
});
