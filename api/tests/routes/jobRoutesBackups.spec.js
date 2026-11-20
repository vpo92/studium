// Spec des routes de gestion des archives de sauvegarde (ticket #5 et #6) :
// POST /admin/jobs/backups (téléversement) et DELETE
// /admin/jobs/backups/:name (suppression). Les dépendances étrangères
// (auth, registre de jobs, mongo,
// logs) sont simulées ; la route réelle est servie par une app express
// éphémère et exercée par de vraies requêtes HTTP. L'exécution de `tar`
// suppose un binaire tar accessible (images Debian, postes de dev).
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import zlib from 'zlib';
import { spawnSync } from 'child_process';

jest.mock('../../src/services/authService', () => ({
  isAdmin: [(req, res, next) => {
    req.user = { email: 'test@example.org' };
    next();
  }],
}));
jest.mock('../../src/services/jobService', () => ({
  create: jest.fn(),
  findActiveByType: jest.fn(),
  list: jest.fn(),
  get: jest.fn(),
  serialize: (job) => job,
}));
jest.mock('../../src/services/jobs', () => ({
  list: () => [],
  get: () => null,
}));
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
jest.mock('../../src/utils/db', () => ({
  get: () => null,
}));

process.env.MONGODB_CONNECTION_STRING = 'mongodb://fake-host:27099/studium-test';

const express = require('express');
const jobRoutes = require('../../src/routes/jobRoutes').default;
const backupLib = require('../../src/services/jobs/backupLib');
const jobService = require('../../src/services/jobService');

// fabrique un dump au format mongodump (studium/fiches.bson.gz + metadata)
function buildValidDump(dir) {
  const dbDir = path.join(dir, 'studium');
  fs.mkdirSync(dbDir);
  fs.writeFileSync(path.join(dbDir, 'fiches.bson.gz'), zlib.gzipSync('bson'));
  fs.writeFileSync(
    path.join(dbDir, 'fiches.metadata.json.gz'),
    zlib.gzipSync('{"indexes":[]}')
  );
  const archive = path.join(dir, 'dump.tar');
  const tar = spawnSync('tar', ['-cf', archive, '-C', dir, 'studium']);
  if (tar.status !== 0) {
    throw new Error('tar indisponible pour la fixture : ' + String(tar.error));
  }
  return archive;
}

function request(server, method, urlPath, body, headers) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: server.port,
      path: urlPath,
      method: method,
      headers: Object.assign({ 'Content-Type': 'application/x-tar' }, headers || {}),
    };
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (error) {
          json = null;
        }
        resolve({ status: res.statusCode, body: json, text: text });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

let server = null;
let port = 0;
let backupDir = '';
let workDir = '';
let validDump = '';

beforeAll((done) => {
  const app = express();
  app.use('/admin/jobs', jobRoutes);
  server = app.listen(0, '127.0.0.1', () => {
    port = server.address().port;
    done();
  });
});

afterAll((done) => {
  if (server) {
    server.close(done);
  } else {
    done();
  }
});

beforeEach(() => {
  backupDir = fs.mkdtempSync(path.join(os.tmpdir(), 'studium-upload-backups-'));
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'studium-upload-work-'));
  validDump = buildValidDump(workDir);
  process.env.BACKUP_DIR = backupDir;
  // par défaut : aucun traitement de restauration actif dans les parages
  jobService.findActiveByType.mockResolvedValue(null);
});

afterEach(() => {
  delete process.env.BACKUP_DIR;
  delete process.env.BACKUP_UPLOAD_MAX_BYTES;
  backupLib.removeDir(backupDir);
  backupLib.removeDir(workDir);
});

describe('POST /admin/jobs/backups (téléversement)', () => {
  it('importe un dump valide, renommé au format des archives', async () => {
    const content = fs.readFileSync(validDump);

    const response = await request(
      { port: port }, 'POST', '/admin/jobs/backups?filename='
        + encodeURIComponent('mon dump du 20 nov.tar'),
      content, {}
    );

    expect(response.status).toBe(201);
    expect(response.body.name).toMatch(/^studium-upload-.*-mon-dump-du-20-nov\.tar$/);
    expect(response.body.size).toBe(content.length);
    const stored = path.join(backupDir, response.body.name);
    expect(fs.readFileSync(stored).length).toBe(content.length);
    // aucun résidu temporaire derrière soi
    expect(fs.readdirSync(backupDir)).toEqual([response.body.name]);
  });

  it('fait apparaître l\'archive dans la liste des sauvegardes', async () => {
    const content = fs.readFileSync(validDump);
    await request(
      { port: port }, 'POST', '/admin/jobs/backups?filename=a.tar', content, {}
    );

    const listed = await request({ port: port }, 'GET', '/admin/jobs/backups', null, {});

    expect(listed.status).toBe(200);
    expect(listed.body.length).toBe(1);
    expect(listed.body[0].name).toMatch(/^studium-upload-/);
    expect(listed.body[0].size).toBe(content.length);
  });

  it('refuse une archive illisible, sans rien laisser dans BACKUP_DIR', async () => {
    const response = await request(
      { port: port }, 'POST', '/admin/jobs/backups?filename=faux.tar',
      Buffer.from('ceci n\'est pas un tar'), {}
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/mongodump|illisible/i);
    expect(fs.readdirSync(backupDir)).toEqual([]);
  });

  it('refuse un tar sans collections .bson.gz (non restaurable)', async () => {
    // un tar parfaitement lisible, mais sans contenu restaurable
    const junkDir = path.join(workDir, 'bidon');
    fs.mkdirSync(junkDir);
    fs.writeFileSync(path.join(junkDir, 'lecture.txt'), 'pas un dump');
    const junkArchive = path.join(workDir, 'junk.tar');
    const tar = spawnSync('tar', ['-cf', junkArchive, '-C', workDir, 'bidon']);
    expect(tar.status).toBe(0);

    const response = await request(
      { port: port }, 'POST', '/admin/jobs/backups?filename=junk.tar',
      fs.readFileSync(junkArchive), {}
    );

    expect(response.status).toBe(400);
    expect(fs.readdirSync(backupDir)).toEqual([]);
  });

  it('refuse au-delà de BACKUP_UPLOAD_MAX_BYTES (413)', async () => {
    process.env.BACKUP_UPLOAD_MAX_BYTES = '1024';

    const response = await request(
      { port: port }, 'POST', '/admin/jobs/backups?filename=gros.tar',
      Buffer.alloc(4096, 7), {}
    );

    expect(response.status).toBe(413);
    expect(response.body.message).toMatch(/volumineux/i);
    expect(fs.readdirSync(backupDir)).toEqual([]);
  });

  it('refuse un corps vide (400)', async () => {
    const response = await request(
      { port: port }, 'POST', '/admin/jobs/backups?filename=vide.tar', null, {}
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/vide/i);
  });

  it('refuse un corps déguisé en formulaire JSON (415)', async () => {
    const response = await request(
      { port: port }, 'POST', '/admin/jobs/backups?filename=x.tar',
      Buffer.from('tar'), { 'Content-Type': 'application/json' }
    );

    expect(response.status).toBe(415);
    expect(fs.readdirSync(backupDir)).toEqual([]);
  });

  it('numérote les imports successifs d\'un même nom dans la même seconde', async () => {
    const content = fs.readFileSync(validDump);

    const first = await request(
      { port: port }, 'POST', '/admin/jobs/backups?filename=x.tar', content, {}
    );
    const second = await request(
      { port: port }, 'POST', '/admin/jobs/backups?filename=x.tar', content, {}
    );

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.name).toMatch(/-2\.tar$/);
    expect(fs.readdirSync(backupDir).length).toBe(2);
  });
});

describe('DELETE /admin/jobs/backups/:name (suppression)', () => {
  it('supprime une archive existante', async () => {
    const archive = 'studium-20261120-120000-a-jeter.tar';
    fs.writeFileSync(path.join(backupDir, archive), 'tar');

    const response = await request(
      { port: port }, 'DELETE', '/admin/jobs/backups/' + archive, null, {}
    );

    expect(response.status).toBe(200);
    expect(response.body.deleted).toBe(archive);
    expect(fs.existsSync(path.join(backupDir, archive))).toBe(false);
  });

  it('retourne 404 pour une archive inexistante', async () => {
    const response = await request(
      { port: port }, 'DELETE', '/admin/jobs/backups/studium-20261120-120000.pdf.tar', null, {}
    );

    expect(response.status).toBe(404);
  });

  it('retourne 400 pour un nom invalide, sans toucher au disque', async () => {
    const victim = 'studium-20261120-120000-victime.tar';
    fs.writeFileSync(path.join(backupDir, victim), 'tar');

    const sneaky = encodeURIComponent('evil/' + victim);
    const response = await request(
      { port: port }, 'DELETE', '/admin/jobs/backups/' + sneaky, null, {}
    );

    expect(response.status).toBe(400);
    expect(fs.existsSync(path.join(backupDir, victim))).toBe(true);
  });

  it('refuse (409) de supprimer l\'archive d\'une restauration encore active', async () => {
    const archive = 'studium-20261120-120000-en-cours.tar';
    fs.writeFileSync(path.join(backupDir, archive), 'tar');
    jobService.findActiveByType.mockResolvedValue({
      _id: 'job1',
      type: 'restore',
      status: 'running',
      params: { archive: archive, confirm: 'RESTAURER' },
    });

    const response = await request(
      { port: port }, 'DELETE', '/admin/jobs/backups/' + archive, null, {}
    );

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/restauration/i);
    expect(fs.existsSync(path.join(backupDir, archive))).toBe(true);
  });

  it('laisse passer la suppression si la restauration active vise une autre archive', async () => {
    const archive = 'studium-20261120-120000-libre.tar';
    fs.writeFileSync(path.join(backupDir, archive), 'tar');
    jobService.findActiveByType.mockResolvedValue({
      _id: 'job2',
      type: 'restore',
      status: 'queued',
      params: { archive: 'studium-20261120-115959-autre.tar' },
    });

    const response = await request(
      { port: port }, 'DELETE', '/admin/jobs/backups/' + archive, null, {}
    );

    expect(response.status).toBe(200);
    expect(fs.existsSync(path.join(backupDir, archive))).toBe(false);
  });
});
