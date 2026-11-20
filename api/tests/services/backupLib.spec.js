// Spec unitaire de backupLib : résolution sûre du chemin d'une archive de
// sauvegarde (GET /admin/jobs/backups/:name/download). Aucune commande
// externe ni base simulée ici : uniquement le système de fichiers.
import fs from 'fs';
import os from 'os';
import path from 'path';

jest.mock('../../src/utils/db', () => ({
  get: jest.fn(),
}));

process.env.MONGODB_CONNECTION_STRING = 'mongodb://fake-host:27099/studium-test';

const backupLib = require('../../src/services/jobs/backupLib');

const VALID_ARCHIVE = 'studium-20261120-120000-test.tar';

let backupDir = '';

beforeEach(() => {
  backupDir = fs.mkdtempSync(path.join(os.tmpdir(), 'studium-backups-'));
  process.env.BACKUP_DIR = backupDir;
});

afterEach(() => {
  backupLib.removeDir(backupDir);
  delete process.env.BACKUP_DIR;
});

describe('getBackupDir', () => {
  it('résout BACKUP_DIR depuis l’environnement', () => {
    expect(backupLib.getBackupDir()).toBe(backupDir);
  });
});

describe('getArchivePath', () => {
  it('retourne le chemin absolu d’une archive existante', () => {
    const file = path.join(backupDir, VALID_ARCHIVE);
    fs.writeFileSync(file, 'tar');

    expect(backupLib.getArchivePath(VALID_ARCHIVE)).toBe(file);
  });

  it('retourne null si l’archive n’existe pas', () => {
    expect(backupLib.getArchivePath(VALID_ARCHIVE)).toBeNull();
  });

  it('retourne null si le nom désigne un répertoire', () => {
    fs.mkdirSync(path.join(backupDir, VALID_ARCHIVE));

    expect(backupLib.getArchivePath(VALID_ARCHIVE)).toBeNull();
  });

  it('rejette les noms invalides avec une erreur 400', () => {
    const invalid = [
      '',
      null,
      undefined,
      'studium-x.tar', // horodatage trop court (< 8 caractères)
      'not-an-archive.txt',
      '../etc/passwd',
      'a/studium-20261120-120000.tar',
      'studium-20261120-120000.tar/../../evil',
    ];
    invalid.forEach((name) => {
      let error = null;
      try {
        backupLib.getArchivePath(name);
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeNull();
      expect(error.status).toBe(400);
    });
  });

  it('ne sort jamais de BACKUP_DIR (pas de traversée de chemin)', () => {
    // Le fichier cible existe mais son nom contient un chemin : rejeté 400.
    fs.writeFileSync(path.join(backupDir, VALID_ARCHIVE), 'tar');
    const traversal = `sub/../${VALID_ARCHIVE}`;

    expect(() => backupLib.getArchivePath(traversal)).toThrow(/invalide/);
  });
});
