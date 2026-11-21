// Spec unitaire du job de restauration : client MongoDB simulé (drop,
// insert, createIndex, curseur raw), `tar` simulé ; les fichiers du dump
// sont de vrais `.bson.gz` au format mongodump (sérialisés avec bson 1.x).
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
const DESERIALIZE_OPTIONS = { promoteValues: false, promoteLongs: false };

process.env.MONGODB_CONNECTION_STRING = 'mongodb://fake-host:27099/studium-test';

const restoreJob = require('../../src/services/jobs/restoreJob');

// ---------------------------------------------------------------------------
// État des faux
// ---------------------------------------------------------------------------

let backupDir = '';
let liveCollections = [];                 // collections présentes en base
let rawDocsByCollection = {};             // pour les dumps de pre-backup
let failInsertFor = [];                   // collections dont l'insert échoue
let dropErrorFor = [];                    // collections dont le drop échoue (sauf ns)
let extractedTree = null;                 // source copiée par `tar -xf`

const calls = { dropped: [], inserted: {}, indexes: {}, tar: [] };

function bsonGzOf(docs) {
  return zlib.gzipSync(Buffer.concat(docs.map((doc) => serializer.serialize(doc))));
}

function metadataGzOf(collection, indexes) {
  return zlib.gzipSync(Buffer.from(JSON.stringify({
    options: {},
    indexes: indexes.map((index) => Object.assign(
      { ns: 'studium-src.' + collection }, index)),
  }), 'utf8'));
}

// ---------------------------------------------------------------------------
// Faux client MongoDB
// ---------------------------------------------------------------------------

function makeRawStream(collection) {
  const stream = new PassThrough({ objectMode: true });
  process.nextTick(() => {
    (rawDocsByCollection[collection] || []).forEach((doc) => {
      stream.write(serializer.serialize(doc));
    });
    stream.end();
  });
  return stream;
}

function fakeCollectionHandle(name) {
  return {
    find: () => ({ stream: () => makeRawStream(name) }),
    indexes: (cb) => process.nextTick(() => cb(null, [{ v: 2, key: { _id: 1 }, name: '_id_' }])),
    drop: (cb) => process.nextTick(() => {
      if (dropErrorFor.indexOf(name) !== -1) {
        const error = new Error('operation not authorized');
        return cb(error);
      }
      calls.dropped.push(name);
      return cb(null, true);
    }),
    insert: (docs, options, cb) => process.nextTick(() => {
      if (failInsertFor.indexOf(name) !== -1) {
        return cb(new Error('E11000 duplicate key (simulated)'));
      }
      calls.inserted[name] = (calls.inserted[name] || []).concat(docs);
      return cb(null, { result: { ok: 1, n: docs.length } });
    }),
    createIndex: (key, options, cb) => process.nextTick(() => {
      (calls.indexes[name] = calls.indexes[name] || []).push({ key, options });
      return cb(null, 'index_ok');
    }),
  };
}

function fakeClient() {
  return {
    db: () => ({ collection: fakeCollectionHandle }),
    listCollections: () => ({
      toArray: async () => liveCollections.map((name) => ({ name: name })),
    }),
  };
}

// ---------------------------------------------------------------------------
// Faux `tar`
// ---------------------------------------------------------------------------

function copyTree(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
  fs.readdirSync(src).forEach((entry) => {
    const from = path.join(src, entry);
    const to = path.join(dest, entry);
    if (fs.statSync(from).isDirectory()) {
      copyTree(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  });
}

childProcess.spawn.mockImplementation((command, args) => {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  process.nextTick(() => {
    if (command !== 'tar') {
      child.emit('close', 1);
      return;
    }
    calls.tar.push(args.slice());
    if (args[0] === '-cf') {
      fs.writeFileSync(args[1], 'tar-content');
      child.emit('close', 0);
    } else if (args[0] === '-xf') {
      if (!extractedTree) {
        child.stderr.write('tar: This does not look like a tar archive\n');
        return child.emit('close', 2);
      }
      const dest = args[3]; // ['-xf', archive, '-C', dest]
      try {
        copyTree(extractedTree, dest);
        child.emit('close', 0);
      } catch (error) {
        child.emit('close', 1);
      }
    } else {
      child.emit('close', 0);
    }
  });
  return child;
});

// ---------------------------------------------------------------------------
// Helpers de job/ctx
// ---------------------------------------------------------------------------

const STAMP = '20260102-030405';
const ARCHIVE = `studium-${STAMP}.tar`;

function makeJob(params, cursor) {
  return {
    _id: 'job-id',
    type: 'restore',
    params: params || {},
    status: 'running',
    total: 0,
    processed: 0,
    succeeded: 0,
    failedCount: 0,
    cursor: cursor || null,
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
    cursorIndex: null,
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
      if (step.success === false) { counters.failedCount += 1; } else { counters.succeeded += 1; }
      if (step.cursor) { counters.cursor = step.cursor; }
    },
    counters: () => Object.assign({}, counters),
  };
  return ctx;
}

/** Dump mongodump de référence : db source « studium-src », users + notes. */
function buildFixtureDump() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studium-fixture-'));
  const dbDir = path.join(dir, 'studium-src');
  fs.mkdirSync(dbDir);
  const users = [
    { _id: new bson.ObjectID('507f1f77bcf86cd799439011'), email: 'a@b.c', n: new bson.Int32(7) },
    { _id: new bson.ObjectID(), email: 'd@e.f', at: new Date(1234567890) },
  ];
  const notes = [{ _id: new bson.ObjectID(), text: 'note 1' }];
  fs.writeFileSync(path.join(dbDir, 'users.bson.gz'), bsonGzOf(users));
  fs.writeFileSync(path.join(dbDir, 'users.metadata.json.gz'), metadataGzOf('users', [
    { v: 2, key: { email: 1 }, name: 'email_1', unique: true },
  ]));
  fs.writeFileSync(path.join(dbDir, 'notes.bson.gz'), bsonGzOf(notes));
  return { root: dir, users, notes };
}

/** Dump « contenu » : données métier seules, sans users. */
function buildContenuDump() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studium-fixture-'));
  const dbDir = path.join(dir, 'studium-src');
  fs.mkdirSync(dbDir);
  const notes = [{ _id: new bson.ObjectID(), text: 'note 1' }];
  fs.writeFileSync(path.join(dbDir, 'notes.bson.gz'), bsonGzOf(notes));
  return { root: dir, notes };
}

/** Écrit le manifeste de type à la racine d'une fixture (comme le job backup). */
function addFixtureManifest(root, mode) {
  fs.writeFileSync(path.join(root, 'studium-backup-info.json.gz'),
    zlib.gzipSync(Buffer.from(JSON.stringify({ mode: mode, dbName: 'studium-src' }), 'utf8')));
}

beforeEach(() => {
  backupDir = fs.mkdtempSync(path.join(os.tmpdir(), 'studium-restore-test-'));
  process.env.BACKUP_DIR = backupDir;
  fs.writeFileSync(path.join(backupDir, ARCHIVE), 'archive-placeholder');
  liveCollections = ['users', 'notes', 'old_stuff', 'logs', 'jobs'];
  rawDocsByCollection = { users: [], notes: [], old_stuff: [], logs: [], jobs: [] };
  failInsertFor = [];
  dropErrorFor = [];
  extractedTree = null;
  calls.dropped = [];
  calls.inserted = {};
  calls.indexes = {};
  calls.tar = [];
  dbMock.get.mockReturnValue(fakeClient());
});

// ---------------------------------------------------------------------------

describe('restoreJob — garde-fous', () => {
  it('refuse de démarrer sans la phrase de confirmation', async () => {
    const ctx = makeCtx(makeJob({ archive: ARCHIVE }));
    await expect(restoreJob.run(ctx)).rejects.toThrow(/confirm/i);
    expect(calls.dropped).toEqual([]);
  });

  it('rejette un nom d’archive invalide (chemin, extension, format)', async () => {
    await expect(restoreJob.run(makeCtx(makeJob(
      { archive: '../../etc/passwd', confirm: 'RESTAURER' }))))
      .rejects.toThrow(/invalide/);
    await expect(restoreJob.run(makeCtx(makeJob(
      { archive: 'studium-20260102-030405.sh', confirm: 'RESTAURER' }))))
      .rejects.toThrow(/invalide/);
  });

  it('refuse une archive absente du répertoire de sauvegarde', async () => {
    await expect(restoreJob.run(makeCtx(makeJob(
      { archive: 'studium-19990101-000000.tar', confirm: 'RESTAURER' }))))
      .rejects.toThrow(/introuvable/);
  });
});

describe('restoreJob — restauration complète', () => {
  it('drop+réinsère les collections du dump, recrée les index, supprime les hors-dump', async () => {
    const fixture = buildFixtureDump();
    extractedTree = fixture.root;

    const job = makeJob({ archive: ARCHIVE, confirm: 'RESTAURER', preBackup: false });
    const ctx = makeCtx(job);

    await restoreJob.run(ctx);

    expect(ctx.steps.map((s) => s.reference)).toEqual(
      ['extraction', 'notes', 'users', 'drop:old_stuff']
    );
    expect(ctx.steps.every((s) => s.success)).toBe(true);

    // Collections restaurées : drop puis contenu inséré ; puis hors-dump.
    expect(calls.dropped).toEqual(['notes', 'users', 'old_stuff']);
    expect(calls.inserted.notes).toHaveLength(1);

    const insertedUsers = calls.inserted.users;
    expect(insertedUsers).toHaveLength(2);
    // Fidélité BSON : types conservés après re-désérialisation stricte.
    expect(insertedUsers[0]._id.toString()).toBe('507f1f77bcf86cd799439011');
    expect(insertedUsers[0].n.constructor.name).toBe('Int32');
    expect(insertedUsers[1].at.getTime()).toBe(1234567890);

    // Index : email_1 recréé, _id_ ignoré (créé automatiquement).
    expect(calls.indexes.users.map((i) => i.options.name)).toEqual(['email_1']);
    expect(calls.indexes.users[0].options.unique).toBe(true);
    expect(calls.indexes.users[0].options.ns).toBeUndefined();
    expect(calls.indexes.notes || []).toEqual([]);

    // Collections protégées jamais supprimées.
    expect(calls.dropped.indexOf('logs')).toBe(-1);
    expect(calls.dropped.indexOf('jobs')).toBe(-1);

    // Message final et nettoyage de l’extraction.
    const message = restoreJob.finalMessage(ctx);
    expect(message).toMatch(/2 collection\(s\) restaurée\(s\)/);
    expect(message).toMatch(/1 supprimée/);
    expect(fs.existsSync(path.join(backupDir, `studium-restore-${STAMP}`))).toBe(false);
  });

  it('reprend après le curseur (collections déjà restaurées sautées)', async () => {
    const fixture = buildFixtureDump();
    extractedTree = fixture.root;

    const job = makeJob({ archive: ARCHIVE, confirm: 'RESTAURER', preBackup: false }, 'r:notes');
    const ctx = makeCtx(job);

    await restoreJob.run(ctx);

    expect(ctx.steps.map((s) => s.reference)).toEqual(['users', 'drop:old_stuff']);
    expect(calls.dropped.indexOf('notes')).toBe(-1);
  });

  it('échoue proprement si une insertion casse, sans archive destructive complète', async () => {
    const fixture = buildFixtureDump();
    extractedTree = fixture.root;
    failInsertFor = ['users'];

    const job = makeJob({ archive: ARCHIVE, confirm: 'RESTAURER', preBackup: false });
    const ctx = makeCtx(job);

    await expect(restoreJob.run(ctx)).rejects.toThrow(/état mixte/);

    const failed = ctx.steps.filter((s) => s.success === false);
    expect(failed.map((s) => s.reference)).toEqual(['users']);
    // Le curseur n'a pas avancé au-delà de notes : la reprise re-dumpera users.
    expect(failed[0].cursor).toBeUndefined();
    // La suppression des hors-dump n'a pas eu lieu (échec avant).
    expect(calls.dropped.indexOf('old_stuff')).toBe(-1);
  });
});

describe('restoreJob — types d\'archive (ticket #10)', () => {
  it('archive manifestée « contenu » : users n\'est ni restauré ni supprimé', async () => {
    const fixture = buildFixtureDump(); // contient users…
    addFixtureManifest(fixture.root, 'contenu'); // …mais déclarée contenu.
    extractedTree = fixture.root;

    const job = makeJob({ archive: ARCHIVE, confirm: 'RESTAURER', preBackup: false });
    const ctx = makeCtx(job);

    await restoreJob.run(ctx);

    expect(ctx.steps.map((s) => s.reference)).toEqual(
      ['extraction', 'notes', 'drop:old_stuff']
    );
    expect(calls.dropped.indexOf('users')).toBe(-1);
    expect(calls.inserted.users).toBeUndefined();
    expect(restoreJob.finalMessage(ctx)).toMatch(/comptes utilisateurs.*préservés/);
  });

  it('archive sans manifeste ni users : deviné « contenu », comptes vivants conservés', async () => {
    const fixture = buildContenuDump();
    extractedTree = fixture.root;

    const job = makeJob({ archive: ARCHIVE, confirm: 'RESTAURER', preBackup: false });
    const ctx = makeCtx(job);

    await restoreJob.run(ctx);

    expect(ctx.steps.map((s) => s.reference)).toEqual(
      ['extraction', 'notes', 'drop:old_stuff']
    );
    expect(calls.dropped.indexOf('users')).toBe(-1);
  });

  it('archive sans manifeste contenant users : comportement historique « full »', async () => {
    const fixture = buildFixtureDump();
    extractedTree = fixture.root;

    const job = makeJob({ archive: ARCHIVE, confirm: 'RESTAURER', preBackup: false });
    const ctx = makeCtx(job);

    await restoreJob.run(ctx);

    expect(ctx.steps.map((s) => s.reference)).toContain('users');
    expect(calls.dropped).toContain('users'); // droppée avant réinsertion
  });

  it('suffixe -full du nom : remplacement intégral, users vivant supprimé si absent du dump', async () => {
    const fullArchive = 'studium-fullname-full.tar';
    fs.writeFileSync(path.join(backupDir, fullArchive), 'archive-placeholder');
    const fixture = buildContenuDump(); // sans users, mais déclarée full
    extractedTree = fixture.root;

    const job = makeJob({ archive: fullArchive, confirm: 'RESTAURER', preBackup: false });
    const ctx = makeCtx(job);

    await restoreJob.run(ctx);

    expect(ctx.steps.map((s) => s.reference)).toEqual(
      ['extraction', 'notes', 'drop:old_stuff', 'drop:users']
    );
  });

  it('params.mode force le type (contenu) même sur une archive contenant users', async () => {
    const fixture = buildFixtureDump();
    extractedTree = fixture.root;

    const job = makeJob({ archive: ARCHIVE, confirm: 'RESTAURER', preBackup: false, mode: 'contenu' });
    const ctx = makeCtx(job);

    await restoreJob.run(ctx);

    expect(calls.dropped.indexOf('users')).toBe(-1);
    expect(calls.inserted.users).toBeUndefined();
  });

  it('refuse un mode invalide avec un message explicite', async () => {
    const fixture = buildFixtureDump();
    extractedTree = fixture.root;

    const job = makeJob({ archive: ARCHIVE, confirm: 'RESTAURER', mode: 'tout' });
    const ctx = makeCtx(job);

    await expect(restoreJob.run(ctx)).rejects.toThrow(/Type de sauvegarde invalide/);
  });
});

describe('restoreJob — sauvegarde de sécurité préalable', () => {
  it('dump l’état courant avant toute écriture et archive le pre-restore', async () => {
    const fixture = buildFixtureDump();
    extractedTree = fixture.root;
    rawDocsByCollection = {
      users: [{ _id: new bson.ObjectID(), gone: true }],
      notes: [],
      old_stuff: [{ _id: new bson.ObjectID(), old: 1 }],
    };

    const job = makeJob({ archive: ARCHIVE, confirm: 'RESTAURER' });
    const ctx = makeCtx(job);

    await restoreJob.run(ctx);

    const refs = ctx.steps.map((s) => s.reference);
    // Le pre-backup (logs/jobs exclus) précède la première écriture.
    expect(refs.slice(0, 4)).toEqual(
      ['pre-backup:notes', 'pre-backup:old_stuff', 'pre-backup:users', 'pre-backup:archive']
    );
    expect(refs).toContain('extraction');
    expect(refs.indexOf('pre-backup:archive'))
      .toBeLessThan(refs.indexOf('users'));

    const preArchive = path.join(backupDir, `studium-pre-restore-${STAMP}.tar`);
    expect(fs.existsSync(preArchive)).toBe(true);
    expect(restoreJob.finalMessage(ctx)).toContain(preArchive);

    const tarCreates = calls.tar.filter((args) => args[0] === '-cf');
    expect(tarCreates.some((args) => /pre-restore/.test(args[1]))).toBe(true);
  });

  it('n\'écrit rien si une étape de préparation échoue (extraction impossible)', async () => {
    // Le pre-backup réussit mais l'archive est illisible (tar -xf échoue) :
    // aucune collection ne doit avoir été touchée.
    extractedTree = null;
    rawDocsByCollection = { users: [{ _id: new bson.ObjectID(), gone: true }] };

    const job = makeJob({ archive: ARCHIVE, confirm: 'RESTAURER' });
    const ctx = makeCtx(job);

    await expect(restoreJob.run(ctx)).rejects.toThrow(/tar/);
    expect(calls.dropped).toEqual([]);
    expect(Object.keys(calls.inserted)).toEqual([]);
    expect(ctx.steps.map((s) => s.reference)).toEqual(
      ['pre-backup:notes', 'pre-backup:old_stuff', 'pre-backup:users', 'pre-backup:archive']
    );
  });
});
